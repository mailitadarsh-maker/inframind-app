import ChatWidget from '../components/ChatWidget';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <ChatWidget />
    </>
  );
}
