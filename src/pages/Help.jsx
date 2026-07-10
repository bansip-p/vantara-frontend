import { hasRole, getCurrentUser } from '../utils/roleHelpers';

function Section({ title, children, roleNote }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-4">
      <h2 className="text-lg font-semibold text-vantaraGreen mb-1">{title}</h2>
      {roleNote && <p className="text-xs text-gray-400 italic mb-3">{roleNote}</p>}
      <div className="text-sm text-gray-700 space-y-2">{children}</div>
    </div>
  );
}

function Help() {
  const user = getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-vantaraGreen mb-2">📖 Help & User Guide</h1>
      <p className="text-sm text-gray-500 mb-6">
        Logged in as <span className="font-medium">{user?.name}</span> ({user?.role})
      </p>

      <Section title="1. The Dashboard">
        <p>Search or filter animals by name, species, or status. Click any animal's card to open its full profile.</p>
      </Section>

      {hasRole('SuperAdmin', 'Veterinarian') && (
        <Section title="2. Registering a New Animal" roleNote="Visible to Admin & Veterinarian only">
          <p>Click "+ Add Animal" on the Dashboard. Fill in the animal's details and optionally attach a photo. A unique QR code is generated automatically — print it and attach it near the enclosure.</p>
        </Section>
      )}

      <Section title="3. Viewing an Animal's Profile">
        <p>Shows the AI Health Score, Risk Level, key details, alert history, diet recommendation, and QR code.</p>
      </Section>

      <Section title="4. Logging a Health Observation">
        <p>On any animal's profile, use the sliders to record changes in movement, food intake, weight, and stress level, then submit. The AI recalculates the health score instantly and creates an alert automatically if risk becomes Medium or High.</p>
      </Section>

      <Section title="5. AI Health Alerts">
        <p>Click the 🔔 bell icon anytime to see all alerts. Filter by Open, Acknowledged, Resolved, or All.</p>
        {hasRole('SuperAdmin', 'Veterinarian') && <p className="italic text-gray-400">As a {user?.role}, you can click "Acknowledge" to mark an alert as handled.</p>}
      </Section>

      <Section title="6. Scanning QR Codes & Daily Checklist" roleNote="Primary workflow for Caretakers">
        <p>Click "📷 Scan" and point your camera at the animal's QR tag, or type the code manually. Tap checklist items as you complete them — no submit button needed.</p>
      </Section>

      {hasRole('SuperAdmin', 'Veterinarian', 'RescueTeam') && (
        <Section title="7. AI Rescue Mission Assistant">
          <p>Click "🚑 Rescue," describe the emergency, and the system instantly recommends the required team, equipment, risk level, and medical preparation.</p>
        </Section>
      )}

      {hasRole('SuperAdmin', 'ManagementViewer', 'Veterinarian') && (
        <Section title="8. Analytics Dashboard" roleNote="Visible to Admin, Veterinarian & Management Viewer">
          <p>Click "📊 Analytics" for a sanctuary-wide overview — total animals, average health score, and charts by species, status, and risk.</p>
        </Section>
      )}

      <Section title="9. Conservation Story Generator">
        <p>On any animal's profile, generate a warm, factual narrative for donor or awareness use. Add real context for a more accurate story, and mark finished stories as "Published."</p>
      </Section>

      <Section title="Need More Help?">
        <p>If something looks wrong, try refreshing the page first. If the issue continues, contact your system administrator with a description of what you were doing.</p>
      </Section>
    </div>
  );
}

export default Help;