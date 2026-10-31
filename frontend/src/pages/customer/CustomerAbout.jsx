function CustomerAbout() {
  return (
    <main className="page-wrap min-h-[60vh] py-10 sm:py-14">
      <section className="overflow-hidden rounded-[1.6rem] border border-[#E2DBD0] bg-[#FFFDF9]">
        <div className="grid gap-10 p-7 sm:p-12 lg:grid-cols-[1.15fr_.85fr] lg:gap-16">
          <div>
            <p className="eyebrow">About us</p>
            <h1 className="display mt-4 max-w-2xl text-[2.8rem] leading-[1.05] text-[#211E1A] sm:text-[3.4rem]">Pika-Chill</h1>
            <p className="mt-6 max-w-xl text-[0.95rem] leading-7 text-[#776F65]">Freshly prepared meals and favorites, ready to enjoy. Order ahead for pickup or takeout, or join us for outdoor seating.</p>
            <p className="mt-4 max-w-xl text-[0.95rem] leading-7 text-[#776F65]">Pika-Chill brings favorite dishes and hearty rice meals together on one menu, freshly prepared when you order.</p>
          </div>

          <div className="flex items-center justify-center">
            <img src="/logo/new-logo.jpg" alt="Pika-Chill" className="w-full max-w-[280px] rounded-[1.4rem] border border-[#E2DBD0] object-cover" />
          </div>
        </div>

        <div className="grid gap-px border-t border-[#E2DBD0] bg-[#E2DBD0] sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['How ordering works', 'Browse the menu, add favorites to your cart, then place an order. We prepare it after confirmation; pay in cash at the counter.'],
            ['Services', 'Reservations · In-store pickup · Delivery · Outdoor seating · Takeout'],
            ['Store hours', '10:00 AM – 9:00 PM daily.'],
            ['Get in touch', '0917 000 0000 · hello@pikachill.app']
          ].map(([title, description]) => (
            <article key={title} className="bg-[#FFFDF9] p-6">
              <h2 className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#948B7F]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#3D3832]">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default CustomerAbout
