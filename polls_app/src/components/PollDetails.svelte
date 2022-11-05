<script>
    import Card from '../shared/Card.svelte'
    import {createEventDispatcher} from 'svelte'
    const dispatch=createEventDispatcher()
    export let poll;
    $: total =poll.votesA+poll.votesB;
    const handleVote=(option,id)=>{
        dispatch('vote',{option,id})
    }
</script>
<div class="poll">
    <Card>
        <h3>{poll.question}</h3>
    <p>Total votes: {total}</p>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="answer" on:click={()=>handleVote('a',poll.id)}>
        <div class="percent percent-a"></div>
        <span>{poll.answerA} ({poll.votesA})</span>
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="answer" on:click={()=>handleVote('b',poll.id)}>
        <div class="percent percent-b"></div>
        <span>{poll.answerB} ({poll.votesB})</span>
    </div>
    </Card>
</div>
<style>
    h3{
        margin: 0px auto;
        color: #555;
    }
    p{
        margin-top: 6px;
        color: #bbb;
    }
    .answer{
        margin: 10px auto;
        background: #fafafa;
        position: relative;
        cursor: pointer;
    }
    .answer.answer:hover{
        opacity: 0.6;
    }
    span{
        padding: 10px 20px;
        display: inline-block;
    }
</style>