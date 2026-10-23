import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const faqs = [
  [
    'Is PlateShare free?',
    'Yes. Sharing and requesting food through the community is free.',
  ],
  [
    'What food can I share?',
    'Share safe, clearly described food that is suitable for collection. Include ingredients and storage notes when they matter.',
  ],
  [
    'How do I arrange collection?',
    'A requester sends a message through the listing. The person sharing the food can confirm or decline and coordinate a pickup time.',
  ],
];

export default function FaqSection() {
  return (
    <section className="section faq-section">
      <div className="container faq-layout">
        <div>
          <p className="eyebrow">A few good questions</p>
          <h2>
            Before we
            <br />
            <em>dig in.</em>
          </h2>
          <Link to="/contact" className="text-link">
            Ask us anything <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="faq-list">
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <span>+</span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
