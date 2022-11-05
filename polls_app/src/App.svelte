<script>
	import Header from "./components/Header.svelte"
	import Footer from "./components/Footer.svelte"
	import Createpoll from "./components/Createpoll.svelte"
	import Tabs from "./shared/Tabs.svelte"
	import PollList from "./components/PollList.svelte"
	//Tabs items
	let items=['Current polls', 'Add new poll'];
	let activeItem='Current polls';
	let tabChange=(e)=>{
		activeItem=e.detail;
	}
	let handleAdd=(e)=>{
		const poll=e.detail;
		polls=[...polls,poll];
		console.log(polls);
		activeItem='Current polls';
	}
	let handleVote=(e)=>{
		const {id,option}=e.detail;
		let copied_polls=[...polls];
		let upvoted=copied_polls.find((poll)=>poll.id==id)
		if (option==='a') {
			upvoted.votesA++			
		}
		if (option==='b') {
			upvoted.votesB++			
		}
		polls=copied_polls;
	}
	let polls=[
		{
			id:2,
			question:'Python or Java',
			answerA:'Python',
			answerB:'Java',
			votesA:12,
			votesB:10
		},
	]


</script>
<Header></Header>
<main>
	<Tabs {activeItem} {items} on:itemActive={tabChange}></Tabs>
	{#if activeItem==='Add new poll'}
		<Createpoll on:additem={handleAdd}></Createpoll>
	{:else if activeItem==='Current polls'}
		<PollList {polls} on:vote={handleVote}/>
	{/if}
</main>
<Footer></Footer>

<style>
	main{
		max-width: 960px;
		margin: 20px auto;
		justify-content: center;
		overflow: hidden;
	}
</style>