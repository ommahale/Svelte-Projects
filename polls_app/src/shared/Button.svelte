<script>
    export let type="primary";
    export let flat=false;
    export let inverse = false;
</script>

<button class={type} class:inverse={inverse} class:flat={flat}>
    <slot></slot>
</button>

<style>
    button{
        border: 0;
        cursor: pointer;
        border-radius: 6px;
        padding: 8px 12px;
        font-weight: bold;
        box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.2);
        margin: 20px;
    }
    .primary{
        color: white;
        background-color: crimson;
    }
    .secondary{
        color: white;
        background-color: rgb(2, 228, 171);
    }
    button{
        margin: auto 95px;
    }
    .primary.inverse{
        color: crimson;
        background-color: white;
        border: 2px solid crimson;
    }
    .secondary.inverse{
        color: rgb(0, 255, 213);
        background-color: white;
        border: 2px solid rgb(0, 255, 213);
    }
</style>