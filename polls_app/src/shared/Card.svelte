<div class="card"><slot></slot></div>
<style>
    .card{
        background-color: rgb(255, 255, 255);
        border-radius: 10px 0px;
        border: 0px solid rgb(192, 192, 192);
        padding: 10px;
        box-shadow: 0px;
        transition: box-shadow 0.3s ease-out;
    }
    .card:hover{
        border: 0px;
        box-shadow: 1px 1px 5px dimgray;
    }
</style>