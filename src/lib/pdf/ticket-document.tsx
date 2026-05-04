import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

type TicketPdfProps = {
  ticket: {
    id: string;
    holder_first_name: string;
    holder_last_name: string;
    max_entries: number;
    used_entries: number;
    status: string;
    qr_token: string;
    parties: {
      title: string;
      starts_at: string;
      location_name: string | null;
      address: string | null;
      important_notes: string | null;
    } | null;
  };
  qrDataUrl: string;
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#09090f",
    color: "#ffffff",
    fontFamily: "Helvetica",
    padding: 36,
  },
  ticket: {
    border: "1px solid #3f3f46",
    borderRadius: 8,
    padding: 24,
  },
  eyebrow: {
    color: "#f0abfc",
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 30,
    fontWeight: 700,
    marginTop: 10,
  },
  meta: {
    color: "#d4d4d8",
    fontSize: 12,
    lineHeight: 1.5,
    marginTop: 14,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    gap: 24,
    marginTop: 26,
  },
  qrWrap: {
    backgroundColor: "#ffffff",
    borderRadius: 6,
    padding: 12,
    width: 180,
  },
  qr: {
    height: 156,
    width: 156,
  },
  details: {
    flex: 1,
  },
  label: {
    color: "#a1a1aa",
    fontSize: 10,
    marginTop: 10,
  },
  value: {
    color: "#ffffff",
    fontSize: 15,
    marginTop: 3,
  },
  note: {
    borderTop: "1px solid #3f3f46",
    color: "#d4d4d8",
    fontSize: 11,
    lineHeight: 1.5,
    marginTop: 24,
    paddingTop: 16,
  },
  code: {
    color: "#a1a1aa",
    fontSize: 8,
    marginTop: 12,
  },
});

export function TicketDocument({ ticket, qrDataUrl }: TicketPdfProps) {
  const party = ticket.parties;
  const remaining = ticket.max_entries - ticket.used_entries;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.ticket}>
          <Text style={styles.eyebrow}>Parti QR Bilet</Text>
          <Text style={styles.title}>{party?.title ?? "Parti Bileti"}</Text>
          <Text style={styles.meta}>
            {party?.starts_at ? new Date(party.starts_at).toLocaleString("tr-TR") : "Tarih açıklanacak"}
            {"\n"}
            {party?.location_name ?? "Mekan açıklanacak"}
            {party?.address ? `\n${party.address}` : ""}
          </Text>

          <View style={styles.row}>
            <View style={styles.qrWrap}>
              {/* eslint-disable-next-line jsx-a11y/alt-text -- React PDF Image does not support the browser alt prop. */}
              <Image src={qrDataUrl} style={styles.qr} />
            </View>
            <View style={styles.details}>
              <Text style={styles.label}>Bilet sahibi</Text>
              <Text style={styles.value}>{ticket.holder_first_name} {ticket.holder_last_name}</Text>

              <Text style={styles.label}>Giriş hakkı</Text>
              <Text style={styles.value}>{ticket.max_entries} kişi</Text>

              <Text style={styles.label}>Kalan hak</Text>
              <Text style={styles.value}>{remaining} kişi</Text>

              <Text style={styles.label}>Durum</Text>
              <Text style={styles.value}>{ticket.status}</Text>
            </View>
          </View>

          <Text style={styles.note}>
            Bu QR kod yalnızca belirtilen kişi sayısı kadar giriş için geçerlidir.
            QR içinde kişisel bilgi tutulmaz; doğrulama sistem tarafından yapılır.
            {party?.important_notes ? `\n\n${party.important_notes}` : ""}
          </Text>
          <Text style={styles.code}>Bilet ID: {ticket.id}</Text>
        </View>
      </Page>
    </Document>
  );
}
