import Navbar from "@/components/navbar";
import SiteFooter from "@/components/site-footer";
import WaitlistForm from "@/components/waitlist-form";

const problems = [
  [
    "01",
    "Not knowing what to promote",
    "Turn a slow day, seasonal moment or new menu item into one clear marketing move.",
  ],
  [
    "02",
    "Spending hours creating content",
    "Prepare the offer, creative brief, captions and customer message from one conversation.",
  ],
  [
    "03",
    "Inconsistent social activity",
    "Keep useful campaign ideas and content direction close to the business, not scattered across chats.",
  ],
  [
    "04",
    "Campaigns without learning",
    "Use connected signals when available to decide what deserves attention next.",
  ],
];

const workflow = [
  [
    "Tell Outreach+ what needs attention",
    "“Tuesday sales are low. What should I do?”",
  ],
  [
    "Receive a campaign recommendation",
    "A clear offer direction, audience and suggested next step.",
  ],
  [
    "Generate the campaign material",
    "Poster brief, captions and a customer message prepared together.",
  ],
  [
    "Review and approve everything",
    "Nothing represents your business until you are happy with it.",
  ],
  [
    "Publish and learn when connected",
    "Use available channel connections and real signals, never invented results.",
  ],
];

const opportunities = [
  [
    "Content opportunity",
    "Breakfast posts are performing better than other content.",
    "Reuse the breakfast theme in this week’s campaign.",
  ],
  [
    "Review opportunity",
    "Recent Google reviews need thoughtful responses.",
    "Prepare review responses for owner approval.",
  ],
  [
    "Consistency opportunity",
    "No content has been published in seven days.",
    "Create a simple weekly campaign to restart momentum.",
  ],
  [
    "Campaign opportunity",
    "A past weekday offer received strong engagement.",
    "Rework the offer with a fresh audience or timing.",
  ],
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="campaign-home">
        <section id="top" className="campaign-hero">
          <div className="shell campaign-hero-grid">
            <div>
              <p className="campaign-kicker">OUTREACH+ FOR HOSPITALITY</p>
              <h1>Turn slow days into busy tables.</h1>
              <p className="campaign-lede">
                Outreach+ identifies what your café or restaurant should
                promote, creates the complete campaign and helps you launch it
                through a simple AI marketing manager.
              </p>
              <div className="campaign-actions">
                <a href="/register" className="campaign-primary">
                  Create My First Campaign <span>→</span>
                </a>
                <a href="/demo" className="campaign-secondary">
                  See a Sample Campaign
                </a>
              </div>
              <p className="campaign-note">
                Built for independent cafés, restaurants and cloud kitchens in
                India.
              </p>
            </div>
            <section
              className="hero-campaign-preview"
              aria-label="Illustrative Outreach+ campaign preview"
            >
              <header>
                <span>OUTREACH+</span>
                <b>Campaign assistant</b>
                <i>Demo preview</i>
              </header>
              <div className="preview-thread">
                <p className="preview-owner">
                  Tuesday sales are low. What should I do?
                </p>
                <p className="preview-agent">
                  I recommend a <b>Student Combo Tuesday</b> campaign based on
                  your weekday goal.
                </p>
              </div>
              <div className="preview-plan">
                <span>Campaign recommendation</span>
                <h2>Student Combo Tuesday</h2>
                <p>
                  Bring nearby students in between 3 and 6 pm with a simple,
                  owner-approved combo.
                </p>
                <div>
                  <b>Offer</b>
                  <b>Poster</b>
                  <b>Caption</b>
                  <b>WhatsApp message</b>
                </div>
                <dl>
                  <div>
                    <dt>Audience</dt>
                    <dd>Nearby students</dd>
                  </div>
                  <div>
                    <dt>Duration</dt>
                    <dd>One Tuesday</dd>
                  </div>
                </dl>
                <span className="preview-action">
                  Review campaign <span>→</span>
                </span>
              </div>
            </section>
          </div>
        </section>

        <section className="campaign-section campaign-problem">
          <div className="shell">
            <p className="campaign-kicker">THE HOSPITALITY REALITY</p>
            <h2>Marketing should not become another full-time job.</h2>
            <div className="problem-grid">
              {problems.map(([number, title, copy]) => (
                <article key={number}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="campaign-section campaign-workflow">
          <div className="shell">
            <p className="campaign-kicker">HOW IT WORKS</p>
            <h2>From a business problem to a ready campaign.</h2>
            <ol>
              {workflow.map(([title, copy], index) => (
                <li key={title}>
                  <span>0{index + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="campaign-section campaign-spotlight">
          <div className="shell campaign-split">
            <div>
              <p className="campaign-kicker">SMART CAMPAIGNS</p>
              <h2>One opportunity. One complete campaign.</h2>
              <p className="campaign-lede">
                Outreach+ assembles the practical pieces, so an owner can focus
                on the final decision instead of starting from a blank page.
              </p>
              <a href="/demo" className="campaign-primary">
                See the campaign example <span>→</span>
              </a>
            </div>
            <article className="campaign-output">
              <p>BUSINESS PROBLEM</p>
              <h3>Wednesday footfall is low.</h3>
              <div className="output-offer">
                <small>RECOMMENDED CAMPAIGN</small>
                <b>Midweek Coffee Break</b>
                <span>
                  A focused afternoon offer for nearby students and
                  professionals.
                </span>
              </div>
              <ul>
                <li>Branded promotional poster brief</li>
                <li>Instagram and Facebook captions</li>
                <li>WhatsApp broadcast message</li>
                <li>Suggested audience and duration</li>
                <li>Clear call to action</li>
              </ul>
              <a href="/register" className="output-action">
                Create a Campaign <span>→</span>
              </a>
            </article>
          </div>
        </section>

        <section className="campaign-section campaign-radar">
          <div className="shell">
            <div className="campaign-section-heading">
              <div>
                <p className="campaign-kicker">
                  OPPORTUNITY RADAR <em>BETA</em>
                </p>
                <h2>Know what deserves attention next.</h2>
              </div>
              <p>
                These examples become data-backed only when the relevant channel
                or profile is connected.
              </p>
            </div>
            <div className="radar-grid">
              {opportunities.map(([title, detected, action]) => (
                <article key={title}>
                  <span>BETA · DEMONSTRATION</span>
                  <h3>{title}</h3>
                  <p>
                    <b>Detected:</b> {detected}
                  </p>
                  <p>
                    <b>Recommended action:</b> {action}
                  </p>
                  <a href="/dashboard/create-campaign">
                    Create Campaign <i>→</i>
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="campaign-section">
          <div className="shell">
            <p className="campaign-kicker">BUILT FOR HOSPITALITY</p>
            <h2>Made for the way food businesses actually work.</h2>
            <div className="hospitality-grid">
              <article>
                <span>CAFÉ</span>
                <h3>“Afternoon walk-ins are quiet.”</h3>
                <p>
                  Prepare a coffee break campaign for nearby students and
                  professionals.
                </p>
              </article>
              <article>
                <span>RESTAURANT</span>
                <h3>“Weekday tables need filling.”</h3>
                <p>Build a considered offer around a slower dining window.</p>
              </article>
              <article>
                <span>CLOUD KITCHEN</span>
                <h3>“Repeat orders have slowed.”</h3>
                <p>Plan a customer message around a relevant reorder moment.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="campaign-section campaign-availability">
          <div className="shell">
            <p className="campaign-kicker">PRODUCT AVAILABILITY</p>
            <h2>Clear about what works today and what is still coming.</h2>
            <div className="availability-grid">
              <article>
                <span>AVAILABLE NOW</span>
                <ul>
                  <li>AI campaign recommendations</li>
                  <li>Poster briefs and caption generation</li>
                  <li>Content calendar and campaign history</li>
                  <li>Editable Brand Profile</li>
                  <li>Campaign approval workflow</li>
                  <li>Social insights when connected</li>
                </ul>
              </article>
              <article>
                <span>COMING LATER</span>
                <ul>
                  <li>PMS and POS integrations</li>
                  <li>Occupancy-aware hotel campaigns</li>
                  <li>Revenue-aware recommendations</li>
                  <li>Advanced CRM segmentation</li>
                  <li>AI-search visibility score</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section id="start" className="campaign-final">
          <div className="shell">
            <p className="campaign-kicker">GET STARTED</p>
            <h2>Your next busy day could start with one campaign.</h2>
            <p>
              Join founding access and tell Outreach+ what you want to improve
              first.
            </p>
            <WaitlistForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
