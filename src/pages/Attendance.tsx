import { AttendanceBoard } from "@/components/employees/AttendanceBoard";
import { Page } from "@/components/Page";

// Davamiyyət (0059–0063): ustaların ay üzrə gəlməsi, icazəsi, gəlmə/getmə saatları. İcazə sorğuları "İcazələr"-dədir.
export default function AttendancePage() {
  return (
    <Page title="Davamiyyət" subtitle="Ay üzrə: işdə, icazəli, gəlmədi; gəlmə və getmə saatları">
      <AttendanceBoard canMark />
    </Page>
  );
}
