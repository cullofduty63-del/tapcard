"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

type ContactActionsProps = {
  fullName: string;
  username: string;
  job?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  location?: string | null;
  accent: string;
  textColor: string;
  buttonColor: string;
};

export default function ContactActions({
  fullName,
  username,
  job,
  phone,
  email,
  website,
  location,
  accent,
  textColor,
  buttonColor,
}: ContactActionsProps) {
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef<HTMLCanvasElement>(null);

  function downloadQR() {
    const canvas = qrRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `${username}-qrcode.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function saveContact() {
    const escapeVCard = (value: string) =>
      value
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");

    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${escapeVCard(fullName || username)}`,
      `N:${escapeVCard(fullName || username)};;;;`,
    ];

    if (job) lines.push(`TITLE:${escapeVCard(job)}`);
    if (phone) lines.push(`TEL;TYPE=CELL:${escapeVCard(phone)}`);
    if (email) lines.push(`EMAIL:${escapeVCard(email)}`);
    if (website) lines.push(`URL:${escapeVCard(website)}`);
    if (location) lines.push(`ADR:;;${escapeVCard(location)};;;;`);

    lines.push("END:VCARD");

    const blob = new Blob(
      ["\uFEFF" + lines.join("\r\n")],
      { type: "text/vcard;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${username}.vcf`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const buttonStyle = {
    flex: "1 1 140px",
    minHeight: "46px",
    padding: "12px 16px",
    borderRadius: "12px",
    border: `1px solid ${accent}88`,
    background: buttonColor,
    color: textColor,
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
  } as const;

  return (
    <>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginTop: "18px",
        }}
      >
        <button
          type="button"
          onClick={() => setShowQR(true)}
          style={buttonStyle}
        >
          ▦ نمایش QR
        </button>

        <button
          type="button"
          onClick={saveContact}
          style={buttonStyle}
        >
          ♡ ذخیره مخاطب
        </button>
      </div>

      {showQR && (
        <div
          onClick={() => setShowQR(false)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setShowQR(false);
          }}
          role="presentation"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "grid",
            placeItems: "center",
            padding: "20px",
            background: "rgba(0,0,0,.78)",
            backdropFilter: "blur(8px)",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="QR کارت"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "340px",
              boxSizing: "border-box",
              padding: "24px",
              borderRadius: "22px",
              border: `1px solid ${accent}`,
              background: "#111015",
              color: "#fff",
              textAlign: "center",
              boxShadow: "0 20px 70px #0008",
            }}
          >
            <h2 style={{ margin: "0 0 8px" }}>کارت دیجیتال من</h2>

            <p style={{ margin: "0 0 20px", color: "#c4b5fd" }}>
              اسکن کن و کارت من رو ببین!
            </p>

            <div
              style={{
                display: "inline-block",
                padding: "12px",
                borderRadius: "14px",
                background: "#fff",
              }}
            >
              <QRCodeCanvas
                ref={qrRef}
                value={
                  typeof window !== "undefined"
                    ? window.location.href
                    : `https://lumocard.ir/${encodeURIComponent(username)}`
                }
                size={220}
                level="H"
                includeMargin
              />
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                onClick={downloadQR}
                style={{
                  ...buttonStyle,
                  background: accent,
                  color: "#fff",
                }}
              >
                ↓ دانلود QR
              </button>

              <button
                type="button"
                onClick={() => setShowQR(false)}
                style={buttonStyle}
              >
                بستن
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
