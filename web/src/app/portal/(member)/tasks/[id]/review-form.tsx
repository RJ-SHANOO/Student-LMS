"use client";

import { useActionState } from "react";
import { reviewSubmissionAction, type ReviewSubmissionState } from "../actions";

const initialState: ReviewSubmissionState = {};

export function ReviewForm({
  taskId,
  studentId,
  remarks,
  marks,
}: {
  taskId: string;
  studentId: string;
  remarks?: string;
  marks?: number;
}) {
  const action = reviewSubmissionAction.bind(null, taskId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-2 border-t border-border pt-3">
      <input type="hidden" name="studentId" value={studentId} />
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs font-medium text-foreground">Marks</label>
          <input
            type="number"
            name="marks"
            min={0}
            defaultValue={marks}
            className="mt-1 block w-full rounded-md border border-border px-2 py-1 text-sm"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-foreground">Remarks</label>
          <input
            type="text"
            name="remarks"
            defaultValue={remarks}
            className="mt-1 block w-full rounded-md border border-border px-2 py-1 text-sm"
          />
        </div>
      </div>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-background disabled:opacity-60"
      >
        {pending ? "Saving..." : "Mark Reviewed"}
      </button>
    </form>
  );
}
