<script>
    export let polls=[]; 
    import PollDetails from "./PollDetails.svelte";
    import pollStore from '../store/pollStore.js'

    pollStore.subscribe((data)=>polls=data)
</script>
<div class="list">
    {#each polls as polls_item (polls_item.id)}
        <div>
            <PollDetails poll={polls_item} on:vote/>
        </div>
    {/each}
</div>
<style>
    .list{
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 10px;
        margin: 4px;
    }

</style>