export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* O'qituvchi menyulari xudo xohlasa shu yerga tushadi */}
      {children}
    </div>
  );
}
