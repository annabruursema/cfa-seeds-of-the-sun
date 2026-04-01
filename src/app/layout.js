import './globals.css';

export const metadata = {
  title: 'Seeds of the Sun | Online Choice Award',
  description: 'Vote for your favorite artwork in the Seeds of the Sun Call for Art exhibition at Milan Art Gallery.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
