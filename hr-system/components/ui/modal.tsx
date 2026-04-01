"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

const ModalCloseContext = React.createContext<(() => void) | null>(null);

type ModalProps = {
  title: string;
  description: string;
  triggerLabel: string;
  triggerVariant?: React.ComponentProps<typeof Button>["variant"];
  children: React.ReactNode;
};

export function Modal({
  title,
  description,
  triggerLabel,
  triggerVariant = "default",
  children,
}: ModalProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = React.useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      <Button onClick={() => setOpen(true)} type="button" variant={triggerVariant}>
        {triggerLabel}
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/25 px-4 py-8 sm:px-8"
          onMouseDown={close}
        >
          <ModalCloseContext.Provider value={close}>
            <div
              className="w-full max-w-3xl rounded-2xl border border-border bg-background shadow-2xl"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Create
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight">{title}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </div>
                <Button onClick={close} type="button" variant="outline">
                  Close
                </Button>
              </div>
              <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-6 py-6">
                {children}
              </div>
            </div>
          </ModalCloseContext.Provider>
        </div>
      ) : null}
    </>
  );
}

export function useModalClose() {
  return React.useContext(ModalCloseContext);
}
