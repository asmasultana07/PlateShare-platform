import { HeartHandshake, MapPin, PackageCheck } from 'lucide-react';

const steps = [
  {
    icon: PackageCheck,
    number: '01',
    title: 'Share what you have',
    text: 'Post good food you cannot use in time. Add a photo, pickup window, and how many people it can serve.',
  },
  {
    icon: MapPin,
    number: '02',
    title: 'Find it nearby',
    text: 'Browse useful food shared by neighbours, community kitchens, and local growers around you.',
  },
  {
    icon: HeartHandshake,
    number: '03',
    title: 'Meet and collect',
    text: 'Send a request, agree on a handoff, and make a meal out of something that might have gone to waste.',
  },
];

export default function HowItWorks() {
  return (
    <section className="section how-section">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A simple way to make a difference</p>
            <h2>
              Good food has <em>another stop.</em>
            </h2>
          </div>
          <p className="heading-aside">
            A few small steps can turn extra into enough.
          </p>
        </div>
        <div className="steps-grid">
          {steps.map(({ icon: Icon, number, title, text }) => (
            <article className="step-item" key={number}>
              <div className="step-top">
                <span>{number}</span>
                <Icon size={22} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
