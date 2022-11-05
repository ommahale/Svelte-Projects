<script>
    export let items;
    export let activeItem;
    import {createEventDispatcher} from 'svelte'
    let dispatch = createEventDispatcher();

</script>

<div class="tabs">
    <ul>
        {#each items as item}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <li on:click={()=>dispatch('itemActive', item)}>
                <div class:active={item===activeItem}>{item}</div>
            </li>
        {/each}
    </ul>
</div>

<style>
    .tabs{
        margin-bottom: 40px;
    }
    li{
        list-style: none;
        padding: 10px;
        cursor: pointer;
        margin: 20px;
        font-size: 18px;
        color: dimgray;
    }
    li:hover{
        color: black;
    }
    .active{
        color: crimson;
        border-bottom: 3px solid crimson;
    }
    ul{
        margin: auto 20px;
        padding: 0;
        display: flex;
        justify-content: center;
    }
    li div{
        text-align: center;
    }
</style>