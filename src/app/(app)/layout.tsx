import { TimeTrackerProvider } from "@/context/TimeTrackerContext";
import { TrackerShell } from "@/components/TrackerShell";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TimeTrackerProvider>
      <TrackerShell>{children}</TrackerShell>
    </TimeTrackerProvider>
  );
}
