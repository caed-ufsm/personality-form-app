// pdf/PDFReport.tsx
import React from "react";
import {
  Document, Page, Text, View, StyleSheet, Image,
} from "@react-pdf/renderer";

export type Answer = {
  label: string;
  value: number | string;
  comment?: string | null;
};

export type Group = {
  title: string;
  items: Answer[];
};

export type PDFReportProps = {
  title?: string;
  respondent?: { name?: string; email?: string };
  groups?: Group[];               // <-- agora opcional
  answers?: Answer[];             // <-- fallback retrocompatível
  footerNote?: string;
  themeColor?: string;
  logo?: { src: string; width?: number; height?: number; alt?: string };

  // notas/cores
  scaleMin?: number;
  scaleMax?: number;
  scaleColors?: string[];

  // textos padrão
  defaultItemText?: string;
  defaultOverviewText?: string;
};

const styles = StyleSheet.create({
  page: { paddingTop: 92, paddingBottom: 70, paddingHorizontal: 36 },
  headerWrap: {
    position: "absolute", top: 18, left: 36, right: 36, height: 58,
    flexDirection: "row", alignItems: "center",
  },
  headerLogo: { marginRight: 12 },
  headerTitle: { fontSize: 16, fontWeight: "bold" },
  meta: { fontSize: 9, color: "#555", marginTop: 2 },
  footerWrap: { position: "absolute", bottom: 18, left: 36, right: 36 },
  footerLine: { height: 1, backgroundColor: "#e6e6e6", marginBottom: 6 },
  footerText: { fontSize: 9, color: "#666" },
  band: { marginTop: 2, marginBottom: 10, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  bandTitle: { fontSize: 14, fontWeight: "bold", color: "white" },
  qWrap: { marginBottom: 8 },
  qRow: { flexDirection: "row", alignItems: "flex-start" },
  qLabel: { flexGrow: 1, fontSize: 11, color: "#222", paddingRight: 8 },
  chip: {
    minWidth: 24, height: 24, borderRadius: 12,
    fontSize: 11, color: "white", textAlign: "center", lineHeight: 24,
    paddingHorizontal: 6,
  },
  itemTextBox: { marginTop: 6, borderRadius: 6, padding: 8, fontSize: 10, color: "#1f2937" },
  divider: { height: 1, backgroundColor: "#ececec", marginVertical: 8 },
  overviewBox: { marginTop: 10, padding: 10, borderRadius: 6, backgroundColor: "#f7f7f7", borderWidth: 1, borderColor: "#e6e6e6" },
  overviewTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 6 },
  overviewLine: { fontSize: 10, marginBottom: 2, color: "#333" },
  overviewTextBox: { marginTop: 8, borderRadius: 6, padding: 8, fontSize: 10, color: "#1f2937", backgroundColor: "#f0f4ff" },
});

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function defaultScaleColors(min: number, max: number, steps: number) {
  const colors: string[] = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const r = Math.round(255 * (1 - t));
    const g = Math.round(200 * t + 55 * (1 - t));
    const b = Math.round(60 * (1 - t));
    colors.push(`rgb(${r}, ${g}, ${b})`);
  }
  return colors;
}

export default function PDFReport({
  title = "Relatório do Formulário",
  respondent,
  groups,
  answers, // fallback
  footerNote,
  themeColor = "#0353a3",
  logo,
  scaleMin = 1,
  scaleMax = 5,
  scaleColors,
  defaultItemText = "Observações gerais sobre esta questão: texto padrão preenchido para registro e contextualização dos resultados.",
  defaultOverviewText = "Síntese da categoria: texto padrão com conclusões gerais, pontos fortes, oportunidades de melhoria e recomendações prioritárias.",
}: PDFReportProps) {
  const now = new Date();
  const steps = scaleMax - scaleMin + 1;
  const colors = scaleColors && scaleColors.length >= steps ? scaleColors : defaultScaleColors(scaleMin, scaleMax, steps);
  const getColorForValue = (v: number) => {
    const idx = clamp(Math.round(v) - scaleMin, 0, steps - 1);
    return colors[idx] ?? themeColor;
  };

  // 🔁 Monta grupos efetivos (se não vier groups, usa answers como 1 seção)
  const effectiveGroups: Group[] =
    (groups && groups.length > 0)
      ? groups
      : answers
        ? [{ title: "Respostas", items: answers }]
        : [];

  return (
    <Document>
      {effectiveGroups.map((g, pageIdx) => {
        const numericValues = g.items
          .map(it => (typeof it.value === "number" ? it.value : parseFloat(String(it.value))))
          .filter(v => !isNaN(v)) as number[];

        const avg = numericValues.length ? (numericValues.reduce((a, b) => a + b, 0) / numericValues.length) : 0;
        const dist: Record<string, number> = {};
        for (let n = scaleMin; n <= scaleMax; n++) dist[n] = 0;
        numericValues.forEach(v => {
          const k = String(clamp(Math.round(v), scaleMin, scaleMax));
          dist[k] = (dist[k] || 0) + 1;
        });
        const minVal = numericValues.length ? Math.min(...numericValues) : "-";
        const maxVal = numericValues.length ? Math.max(...numericValues) : "-";

        return (
          <Page key={pageIdx} size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.headerWrap} fixed>
              {logo?.src ? (
                <Image
                  style={[styles.headerLogo, { width: logo.width ?? 40, height: logo.height ?? 40 }]}
                  src={logo.src}
                />
              ) : null}
              <View>
                <Text style={[styles.headerTitle, { color: themeColor }]}>{title}</Text>
                <Text style={styles.meta}>
                  Gerado em: {now.toLocaleString("pt-BR")}
                  {respondent?.name ? ` • ${respondent.name}` : ""}
                  {respondent?.email ? ` • ${respondent.email}` : ""}
                </Text>
              </View>
            </View>

            {/* Faixa da categoria */}
            <View style={[styles.band, { backgroundColor: themeColor }]} wrap={false}>
              <Text style={styles.bandTitle}>{g.title}</Text>
            </View>

            {/* Conteúdo */}
            <View style={{ flexGrow: 1 }}>
              {g.items.map((a, i) => {
                const num = typeof a.value === "number" ? a.value : parseFloat(String(a.value));
                const chipColor = !isNaN(num) ? getColorForValue(num) : themeColor;
                return (
                  <View key={i} style={styles.qWrap}>
                    <View style={styles.qRow}>
                      <Text style={styles.qLabel}>{a.label}</Text>
                      <Text style={[styles.chip, { backgroundColor: chipColor }]}>{String(a.value ?? "")}</Text>
                    </View>
                    <View style={[styles.itemTextBox, { backgroundColor: "rgb(248, 250, 252)" }]}>
                      <Text>{defaultItemText}</Text>
                    </View>
                    <View style={styles.divider} />
                  </View>
                );
              })}

              {/* Overview da categoria */}
              <View style={styles.overviewBox}>
                <Text style={styles.overviewTitle}>Overview da categoria</Text>
                <Text style={styles.overviewLine}>Média: {numericValues.length ? avg.toFixed(2) : "-"}</Text>
                <Text style={styles.overviewLine}>Mínimo: {String(minVal)}</Text>
                <Text style={styles.overviewLine}>Máximo: {String(maxVal)}</Text>
                <Text style={[styles.overviewLine, { marginTop: 4 }]}>Distribuição:</Text>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {Array.from({ length: steps }).map((_, idx) => {
                    const n = scaleMin + idx;
                    const count = dist[String(n)] || 0;
                    return (
                      <View
                        key={n}
                        style={{
                          paddingVertical: 3, paddingHorizontal: 6, borderRadius: 4,
                          backgroundColor: getColorForValue(n),
                        }}
                      >
                        <Text style={{ fontSize: 9, color: "white" }}>
                          {n}: {count}
                        </Text>
                      </View>
                    );
                  })}
                </View>
                <View style={styles.overviewTextBox}>
                  <Text>{defaultOverviewText}</Text>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footerWrap} fixed>
              <View style={styles.footerLine} />
              <Text style={styles.footerText}>
                {footerNote ? `${footerNote} • ` : ""}
                <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
              </Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );
}
