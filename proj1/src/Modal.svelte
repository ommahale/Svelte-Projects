<script>
    export let showModal=false;
    export let message="default";
    const handleModal=()=>{
    }
</script>
<main>
    {#if showModal}
        <div class="backdrop">
            <div class="modal">
                <div>{message}</div>
                <button on:click={()=>showModal=false}>close</button>
            </div>
        </div>
    {/if}
</main>
<style>
    .backdrop{
        position: fixed;
        background-color: rgba(0, 0, 0, 0.70);
        height: 100%;
        justify-items: center;
        width: 100%;

    }
    .modal{
        background-color: white;
        border-radius: 10px;
        border: 2px solid rgb(22, 22, 22);
        display: block;
        top: 50%;
        padding: 20px;
        bottom: 50%;
        margin: auto 40%;
        margin-top: 5%;
    }
    button{

        width: 5rem;
        margin: auto;
        border-radius: 10px;
        cursor: pointer;
        margin: auto 35%;

    }
    .modal div{
        text-align: center;
        padding: 10px;
    }
</style>