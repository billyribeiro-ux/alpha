<script lang="ts">
	import { study } from '$lib/data/content';
	import { assets } from '$lib/data/assets';
	import Hero from '$lib/components/sections/Hero.svelte';
	import Hypothesis from '$lib/components/sections/Hypothesis.svelte';
	import Equipment from '$lib/components/sections/Equipment.svelte';
	import Pillars from '$lib/components/sections/Pillars.svelte';
	import Journey from '$lib/components/sections/Journey.svelte';
	import Schedule from '$lib/components/sections/Schedule.svelte';
	import Assessments from '$lib/components/sections/Assessments.svelte';
	import Notes from '$lib/components/sections/Notes.svelte';
	import FinalCTA from '$lib/components/sections/FinalCTA.svelte';
	import Footer from '$lib/components/sections/Footer.svelte';
	import ProtocolRule from '$lib/components/viz/ProtocolRule.svelte';

	const title = `${study.name} — ${study.brand}`;
	const description = study.tagline;
	const ogImage = assets.projectAlpha.src;

	const schema = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'ResearchProject',
		name: study.name,
		description: study.tagline,
		sponsor: { '@type': 'Organization', name: study.org },
		investigator: {
			'@type': 'Person',
			name: study.investigator.name,
			jobTitle: study.investigator.role
		},
		keywords: [
			'neurofeedback',
			'alpha brainwaves',
			'EEG',
			'day trading',
			'Muse',
			'Mind Monitor',
			'emotional control'
		]
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="robots" content="index, follow" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={ogImage} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html '<script type="application/ld+json">' + schema + '</' + 'script>'}
</svelte:head>

<main id="main">
	<Hero />
	<ProtocolRule label="Research question" />
	<Hypothesis />
	<ProtocolRule label="Enrollment kit" />
	<Equipment />
	<ProtocolRule label="Daily stack" />
	<Pillars />
	<ProtocolRule label="90-day arc" />
	<Journey />
	<ProtocolRule label="Session day" />
	<Schedule />
	<ProtocolRule label="Visits" />
	<Assessments />
	<ProtocolRule label="Conditions" />
	<Notes />
	<ProtocolRule label="Interest" />
	<FinalCTA />
	<Footer />
</main>
