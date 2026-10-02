"use client";

import { startTransition, useActionState } from "react";
import type { FormState } from "@/lib/validation";

/**
 * Wraps a server action for use with a normal <form onSubmit>.
 * React 19 resets uncontrolled fields after a <form action>, which would wipe
 * what the person typed whenever validation fails. Submitting through onSubmit
 * keeps their input in place.
 */
export function useServerAction(action: (prev: FormState, fd: FormData) => Promise<FormState>) {
  const [state, run, pending] = useActionState<FormState, FormData>(action, {});
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => run(fd));
  };
  return { state, onSubmit, pending };
}
