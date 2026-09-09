import { ObjectId, type Filter } from "mongodb";
import { activityLogCollection } from "@/lib/db/collections";
import type { ActivityLog } from "@/types/models";

interface LogActivityInput {
  tenantId: ObjectId;
  userId: ObjectId;
  action: string;
  description?: string;
}

// Never let a logging failure break the primary operation it's describing.
export async function logActivity(input: LogActivityInput) {
  try {
    const activityLog = await activityLogCollection();
    await activityLog.insertOne({
      tenantId: input.tenantId,
      userId: input.userId,
      action: input.action,
      description: input.description,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Failed to record activity log entry", error);
  }
}

export async function listActivityLog(
  tenantId: ObjectId,
  filters: { userId?: string; limit?: number } = {}
) {
  const activityLog = await activityLogCollection();

  const match: Filter<ActivityLog> = { tenantId };
  if (filters.userId && ObjectId.isValid(filters.userId)) {
    match.userId = new ObjectId(filters.userId);
  }

  return activityLog
    .aggregate([
      { $match: match },
      { $sort: { timestamp: -1 } },
      { $limit: filters.limit ?? 100 },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          action: 1,
          description: 1,
          timestamp: 1,
          "user.name": 1,
          "user.role": 1,
        },
      },
    ])
    .toArray();
}
