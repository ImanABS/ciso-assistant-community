<script lang="ts">
	import { Tab, TabGroup } from '@skeletonlabs/skeleton';
	import type { PageData } from './$types';

	export let data: PageData;

	const aggregateQualityChecks = (item: any) => {
		const types = ['errors', 'warnings', 'info'];
		const result = {};

		types.forEach((type) => {
			result[type] = Object.entries(item.objects).reduce((acc, [key, value]) => {
				if (key !== 'object') {
					acc = [...acc, ...value.quality_check[type]];
				}
				return acc;
			}, []);
		});

		return result;
	};

	const projects = Object.entries(data.data).map(([key, value]) => {
		return {
			id: key,
			tabSet: 0,
			...(value as Record<string, any>),
			compliance_assessments: {
				...value.compliance_assessments,
				...aggregateQualityChecks(value.compliance_assessments)
			},
			risk_assessments: {
				...value.risk_assessments,
				...aggregateQualityChecks(value.risk_assessments)
			}
		};
	});
</script>

<div class="card bg-white p-6 shadow flex flex-col space-y-4">
	{#each projects as project, index}
		{@const compliance_assessments = Object.values(project.compliance_assessments.objects)}
		{@const risk_assessments = Object.values(project.risk_assessments.objects)}
		<div>
			<h1 class="text-2xl font-bold mb-1">
				&#128161; {project.project.name}
			</h1>
			<TabGroup>
				<Tab bind:group={project.tabSet} name="compliance_assessments_tab" value={0}
					>Compliance assessments
					{#if project.compliance_assessments.errors.length > 0}
						<span class="badge variant-soft-error"
							>{project.compliance_assessments.errors.length}</span
						>
					{/if}
					{#if project.compliance_assessments.warnings.length > 0}
						<span class="badge variant-soft-warning"
							>{project.compliance_assessments.warnings.length}</span
						>
					{/if}
					{#if project.compliance_assessments.info.length > 0}
						<span class="badge variant-soft-secondary"
							>{project.compliance_assessments.info.length}</span
						>
					{/if}
				</Tab>
				<Tab bind:group={project.tabSet} name="risk_assessments_tab" value={1}
					>Risk assessments
					{#if project.risk_assessments.errors.length > 0}
						<span class="badge variant-soft-error">{project.risk_assessments.errors.length}</span>
					{/if}
					{#if project.risk_assessments.warnings.length > 0}
						<span class="badge variant-soft-warning"
							>{project.risk_assessments.warnings.length}</span
						>
					{/if}
					{#if project.risk_assessments.info.length > 0}
						<span class="badge variant-soft-secondary">{project.risk_assessments.info.length}</span>
					{/if}
				</Tab>
				<svelte:fragment slot="panel">
					{#if project.tabSet === 0}
						<ul class="list-none pl-4 text-sm space-y-2">
							{#each compliance_assessments as compliance_assessment, index}
								<li class="h4 font-semibold mb-1">
									{compliance_assessment.object.name}
								</li>
								{@const quality_check = compliance_assessment.quality_check}
								<div class="flex flex-col space-y-3">
									{#if quality_check.errors.length > 0}
										<div class="space-y-2">
											<div class="variant-soft-error rounded-token px-2 py-1">
												<i class="fa-solid fa-bug mr-1" />
												{quality_check.errors.length} <span class="font-bold">errors</span> found
											</div>
											<ul class="list-disc pl-4 text-sm">
												{#each quality_check.errors as error}
													<li>{error.msg}</li>
												{/each}
											</ul>
										</div>
									{/if}
									{#if quality_check.warnings.length > 0}
										<div class="space-y-2">
											<div class="variant-soft-warning rounded-token px-2 py-1">
												<i class="fa-solid fa-triangle-exclamation mr-1" />
												{quality_check.warnings.length} <span class="font-bold">warnings</span> found
											</div>
											<ul class="list-disc pl-4 text-sm">
												{#each quality_check.warnings as warning}
													<li>{warning.msg}</li>
												{/each}
											</ul>
										</div>
									{/if}
									{#if quality_check.info.length > 0}
										<div class="space-y-2">
											<div class="variant-soft-secondary rounded-token px-2 py-1">
												<i class="fa-solid fa-circle-info mr-1" />
												{quality_check.info.length} <span class="font-bold">infos</span> found
											</div>
											<ul class="list-disc pl-4 text-sm">
												{#each quality_check.info as info}
													<li>{info.msg}</li>
												{/each}
											</ul>
										</div>
									{/if}
								</div>
								{#if index != compliance_assessments.length - 1}
									<hr />
								{/if}
							{/each}
						</ul>
					{/if}
					{#if project.tabSet === 1}
						<ul class="list-none pl-4 text-sm space-y-2">
							{#each risk_assessments as risk_assessment, index}
								<li class="h4 font-semibold mb-1">
									{risk_assessment.object.name}
								</li>
								{@const quality_check = risk_assessment.quality_check}
								<div class="flex flex-col space-y-3">
									{#if quality_check.errors.length > 0}
										<div class="space-y-2">
											<div class="variant-soft-error rounded-token px-2 py-1">
												<i class="fa-solid fa-bug mr-1" />
												{quality_check.errors.length} <span class="font-bold">errors</span> found
											</div>
											<ul class="list-disc pl-4 text-sm">
												{#each quality_check.errors as error}
													<li>{error.msg}</li>
												{/each}
											</ul>
										</div>
									{/if}
									{#if quality_check.warnings.length > 0}
										<div class="space-y-2">
											<div class="variant-soft-warning rounded-token px-2 py-1">
												<i class="fa-solid fa-triangle-exclamation mr-1" />
												{quality_check.warnings.length} <span class="font-bold">warnings</span> found
											</div>
											<ul class="list-disc pl-4 text-sm">
												{#each quality_check.warnings as warning}
													<li>{warning.msg}</li>
												{/each}
											</ul>
										</div>
									{/if}
									{#if quality_check.info.length > 0}
										<div class="space-y-2">
											<div class="variant-soft-secondary rounded-token px-2 py-1">
												<i class="fa-solid fa-circle-info mr-1" />
												{quality_check.info.length} <span class="font-bold">infos</span> found
											</div>
											<ul class="list-disc pl-4 text-sm">
												{#each quality_check.info as info}
													<li>{info.msg}</li>
												{/each}
											</ul>
										</div>
									{/if}
								</div>
								{#if index != risk_assessments.length - 1}
									<hr />
								{/if}
							{/each}
						</ul>
					{/if}
				</svelte:fragment>
			</TabGroup>
		</div>
		{#if index != projects.length - 1}
			<hr />
		{/if}
	{/each}
</div>