// components/QRScanner.jsx
import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const QRScanner = ({ onScan }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", {
      fps: 10,
      qrbox: 250,
    });

    scanner.render(
      (qrData) => {
        try {
          const parsed = JSON.parse(qrData);
          if (parsed && parsed.label) {
            onScan(parsed.label); // sukses
          } else {
            alert("QR tidak valid: tidak mengandung label");
          }
        } catch {
          alert("QR tidak valid atau format salah");
        }
      },
      (err) => {
        console.warn("QR Scan error", err);
      }
    );

    return () => {
      scanner.clear().catch((err) => {
        console.warn("Gagal membersihkan scanner:", err);
      });
    };
  }, [onScan]);

  return (
    <div
      id="qr-reader"
      className="rounded-xl border border-gray-300 shadow-md p-2"
    />
  );
};

export default QRScanner;
