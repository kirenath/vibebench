import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '80vh', paddingTop: 'var(--space-8)' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
