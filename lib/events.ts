// Local events only. No network calls, storage of form data, pixels or analytics providers.
export function trackIntent(
  action: "whatsapp_click" | "form_whatsapp_open",
  source: string,
  equipmentId?: string,
) {
  window.dispatchEvent(
    new CustomEvent("clj:conversion", {
      detail: { action, source, equipmentId },
    }),
  );
}
