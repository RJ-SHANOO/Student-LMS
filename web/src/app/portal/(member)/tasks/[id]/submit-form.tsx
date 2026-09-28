"use client";

import { useActionState } from "react";
import { submitTaskAction, type SubmitTaskState } from "../actions";

const initialState: SubmitTaskState = {};

export function SubmitForm({ taskId, hasSubmission }: { taskId: string; hasSubmission: boolean }) {
  const action = submitTaskAction.bind(null, taskId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="file" name="file" required className="block w-full text-sm" />
      <p className="text-xs text-muted-foreground">Max 5MB. PDF, Office docs, images, text, or zip.</p>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Uploading..." : hasSubmission ? "Resubmit" : "Submit"}
      </button>
    </form>
  );
}
