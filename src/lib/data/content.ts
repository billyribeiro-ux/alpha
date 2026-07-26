/** Honest study content derived from the Project ALPHA reference page. */

export const study = {
	brand: 'Trick Trades',
	name: 'Project ALPHA',
	tagline:
		'A 90-day research study investigating whether alpha brainwave state training can transform day trading performance, decision-making, and emotional control.',
	disclaimer: 'Details subject to change',
	days: 90,
	participants: 30,
	investigator: {
		name: 'Dr. Olav Krigolson, PhD',
		role: 'Principal Investigator'
	},
	org: 'Trick Trades Inc.',
	hypothesis:
		'Day traders who learn to achieve and maintain an alpha brainwave state (8–12 Hz) will demonstrate reduced emotional reactivity, improved technical execution, shorter learning curves, and greater consistency — compared to their own pre-study baseline.',
	problem:
		'90% of day traders fail — not because they lack knowledge, but because no one teaches them how to control the brain state from which they apply that knowledge. Fear, greed, overtrading, and emotional attachment to money aren’t character flaws. They’re brain states. And they can be trained.',
	dailyCommitment: '~45 minutes beyond trading',
	compliance: '80% minimum compliance across daily protocol elements',
	accountNote: 'Standardized $2,500 account and one-contract sizing',
	alphaBand: { minHz: 8, maxHz: 12 }
} as const;

export type EquipmentItem = {
	id: string;
	title: string;
	body: string;
	icon: 'brain' | 'app' | 'chart' | 'journal';
	accent: string;
};

export const equipment: EquipmentItem[] = [
	{
		id: 'muse',
		title: 'Muse S or Muse S Athena',
		body: 'Consumer EEG headband that reads your brainwave activity. Non-invasive — it reads only, doesn’t emit anything into your brain.',
		icon: 'brain',
		accent: 'var(--alpha-blue)'
	},
	{
		id: 'muse-app',
		title: 'MUSE App',
		body: 'Records and exports your raw EEG data as CSV files for Dr. Krigolson’s analysis. Available on iOS and Android. Included in study.',
		icon: 'app',
		accent: 'var(--alpha-teal)'
	},
	{
		id: 'account',
		title: 'Trading Account',
		body: 'A funded brokerage account with options trading capability. All participants start with the same position sizing: one contract.',
		icon: 'chart',
		accent: 'var(--alpha-red)'
	},
	{
		id: 'membership',
		title: 'Trick Trades Membership',
		body: 'Active membership for CORE ALPHA access, Size UP trade journal, educational content, and community support throughout the study.',
		icon: 'journal',
		accent: 'var(--alpha-gold)'
	}
];

export type Pillar = {
	num: string;
	sub: string;
	title: string;
	body: string;
	accent: string;
};

export const pillars: Pillar[] = [
	{
		num: '01',
		sub: 'Muse Neurofeedback',
		title: 'Daily MUSE Training',
		body: '10–15 minute biofeedback sessions using the Muse app. MIND sessions train focused attention through audio feedback — calm mind produces beach sounds, wandering mind triggers storms. STRENGTH sessions (Phase 2+, Athena only) train prefrontal cortex engagement for executive function and impulse control.',
		accent: 'var(--alpha-blue)'
	},
	{
		num: '02',
		sub: 'Pre-Market Meditation',
		title: 'CORE ALPHA Session',
		body: '15–30 minute Trick Trades proprietary binaural-beat meditation before market open, recorded via Mind Monitor. This trains your brain to enter an alpha state intentionally and establishes a calm, focused baseline before you trade. Think of it as a pre-flight checklist for your mind.',
		accent: 'var(--alpha-red)'
	},
	{
		num: '03',
		sub: 'Live EEG Monitoring',
		title: 'Trading with Your Brain Visible',
		body: 'Wear your Muse headband during every live trading session. Mind Monitor records your brainwave activity in real-time, creating a second-by-second map of your brain state alongside your trades. This data reveals what’s happening between your ears at the moment of every decision.',
		accent: 'var(--alpha-teal)'
	}
];

export type Phase = {
	id: string;
	tag: string;
	title: string;
	body: string;
	bullets: string[];
	color: string;
};

export const phases: Phase[] = [
	{
		id: 'preload',
		tag: 'Days −7 to −1',
		title: 'Preloading Phase',
		body: 'Set up your equipment, complete practice sessions, establish your brain snapshot baseline (3 min eyes-open + 3 min eyes-closed EEG recording), and finish the intake questionnaire. This is about getting comfortable with the tools before anything is at stake.',
		bullets: [
			'Device setup and Mind Monitor configuration',
			'2–3 practice meditation sessions',
			'Baseline brain snapshot recording',
			'Intake questionnaire and orientation'
		],
		color: '#980000'
	},
	{
		id: 'phase1',
		tag: 'Days 1–30 — Foundation',
		title: 'Phase 1: Build the Baseline',
		body: 'Paper trade Days 1–5 to embed the feeling of calm, objective trading without financial fear. Live trading begins Day 6 with one contract. Daily CORE ALPHA + MUSE MIND training. Weekly EEG data submission to Dr. Krigolson.',
		bullets: [
			'Paper trading baseline (Days 1–5) — train without financial pressure',
			'Live trading begins Day 6 with strict one-contract sizing',
			'Establish daily CORE + MUSE routine',
			'Weekly data submissions begin'
		],
		color: '#3b8beb'
	},
	{
		id: 'phase2',
		tag: 'Days 31–60 — Integration',
		title: 'Phase 2: Layer the Tools',
		body: 'Add MUSE STRENGTH training for executive function. Mid-study brain snapshot at Day 45. Focus on recognizing alpha-to-high-beta transitions in real-time — learning to catch yourself before a bad decision, not after.',
		bullets: [
			'STRENGTH training added (Athena headband users)',
			'Mid-study brain snapshot and evaluation at Day 45',
			'Focus on real-time state awareness during trading',
			'Mid-study questionnaire'
		],
		color: '#2bbfa0'
	},
	{
		id: 'phase3',
		tag: 'Days 61–90 — Mastery',
		title: 'Phase 3: Prove the Pattern',
		body: 'Full protocol execution with all three pillars active. Consistency is the goal. Final brain snapshot at Day 90, comprehensive data submission, and the final offboarding questionnaire. This is where the hypothesis is tested.',
		bullets: [
			'Full protocol with all training components active',
			'Focus on consistency and pattern reinforcement',
			'Final brain snapshot and data submission',
			'Final offboarding questionnaire'
		],
		color: '#d4a853'
	}
];

export type ScheduleBlock = {
	timeLabel: string;
	title: string;
	items: { time: string; text: string }[];
	accent: string;
};

export const schedule: ScheduleBlock[] = [
	{
		timeLabel: 'Pre-Market — 60 min before open',
		title: 'Morning Preparation',
		accent: '#3b8beb',
		items: [
			{ time: '5 min', text: 'Connect headband, verify signal quality' },
			{ time: '15–30m', text: 'CORE ALPHA Session (binaural beat meditation)' },
			{ time: '10–15m', text: 'Breath-linked chart observation' },
			{ time: '5–10m', text: 'Review trading plan and intentions' }
		]
	},
	{
		timeLabel: 'Market Hours',
		title: 'Live Trading Session',
		accent: '#b82020',
		items: [
			{ time: 'Ongoing', text: 'Trade with Muse headband on, Mind Monitor recording continuously' },
			{ time: 'Ongoing', text: 'One contract position sizing, follow your wheelhouse' },
			{ time: 'Ongoing', text: 'Log exact trade times (to the minute) in Size UP' }
		]
	},
	{
		timeLabel: 'Post-Market',
		title: 'Debrief & Data',
		accent: '#2bbfa0',
		items: [
			{ time: '—', text: 'Stop Mind Monitor recording, export session data' },
			{ time: '5–10m', text: 'Post-market debrief meditation' },
			{ time: '5–10m', text: 'Complete trade journal in Size UP' }
		]
	},
	{
		timeLabel: 'Evening',
		title: 'Training & Reflection',
		accent: '#d4a853',
		items: [
			{ time: '10–15m', text: 'MUSE MIND biofeedback session' },
			{ time: '10–15m', text: 'MUSE STRENGTH session (Phase 2+)' },
			{ time: '5 min', text: 'Journal entry / personal reflection' },
			{ time: 'Weekly', text: 'Submit all Mind Monitor CSV exports to Dr. Krigolson' }
		]
	}
];

export type Assessment = {
	when: string;
	title: string;
	items: string[];
};

export const assessments: Assessment[] = [
	{
		when: 'Preloading (Day −7 to −1)',
		title: 'Baseline',
		items: [
			'Brain snapshot (eyes open + closed)',
			'Intake questionnaire',
			'Trading history review',
			'Equipment verification'
		]
	},
	{
		when: 'Day 45',
		title: 'Mid-Study Check',
		items: [
			'Brain snapshot comparison',
			'Mid-study evaluation',
			'Trading performance review',
			'Protocol adjustment if needed'
		]
	},
	{
		when: 'Day 90 + Day 180',
		title: 'Final & Follow-Up',
		items: [
			'Final brain snapshot',
			'Offboarding questionnaire',
			'Complete data submission',
			'90-day follow-up assessment'
		]
	}
];

export type Note = {
	title: string;
	body: string;
	icon: 'warning' | 'lock' | 'door' | 'clipboard';
};

export const notes: Note[] = [
	{
		title: 'Financial Risk Disclosure',
		icon: 'warning',
		body: 'Day trading involves substantial risk of financial loss. This study does not guarantee improved performance or profitability. You are trading with your own money. The standardized $2,500 account and one-contract sizing are designed to limit exposure, but losses are possible and should be expected as part of the learning process.'
	},
	{
		title: 'Your Data Is Protected',
		icon: 'lock',
		body: 'All EEG and performance data is de-identified before analysis. Your name never appears in data files shared with the research team. Published research uses only anonymized, aggregated data. You will not be individually identifiable unless you give separate written consent.'
	},
	{
		title: 'You Can Leave Anytime',
		icon: 'door',
		body: 'Participation is voluntary. You can withdraw at any time, for any reason, without consequence to your Trick Trades membership. If you withdraw, data already submitted and anonymized may be retained, but identifiable data will be removed at your request.'
	},
	{
		title: 'Compliance Matters',
		icon: 'clipboard',
		body: 'The quality of the research depends on consistent participation. We ask for a minimum 80% compliance rate across all daily protocol elements. If you’re struggling to keep up, reach out — we’d rather help you stay on track than lose your data.'
	}
];

export const navLinks = [
	{ href: '#hypothesis', label: 'Hypothesis' },
	{ href: '#equipment', label: 'Equipment' },
	{ href: '#pillars', label: 'Pillars' },
	{ href: '#journey', label: 'Journey' },
	{ href: '#schedule', label: 'Daily' },
	{ href: '#assessments', label: 'Assess' },
	{ href: '#apply', label: 'Apply' }
] as const;
