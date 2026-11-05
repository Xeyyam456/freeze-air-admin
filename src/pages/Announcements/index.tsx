import { useEffect } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { Page } from "@/components/Page";
import { revalidate } from "@/lib/revalidate";
import { useData } from "@/lib/useData";
import { fetchAnnouncements, markAnnouncementsSeen } from "@/services/announcements/announcements";
import { AnnouncementForm } from "./components/AnnouncementForm";
import { AnnouncementList } from "./components/AnnouncementList";

// Elanlar (0098): rəhbərlik hamıya toplu bildiriş göndərir ("sabah saat 9-da iclas"); hamının cihazına push gedir.
// Solda yeni elan, sağda (mobildə altda) göndərilənlər. Səhifə açılanda hamısı oxundu (menyu nişanı sıfırlanır).
export default function AnnouncementsPage() {
  const { session, admin } = useAuth();
  const items = useData("announcements", fetchAnnouncements);
  useEffect(() => {
    void markAnnouncementsSeen().then(() => revalidate("nav-badges"));
  }, []);

  return (
    <Page title="Elanlar" subtitle="Bütün komandaya bildiriş göndər">
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <AnnouncementForm />
        <AnnouncementList items={items} me={session?.user.id ?? null} admin={admin} />
      </div>
    </Page>
  );
}
