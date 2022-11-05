<script>
    import Button from '../shared/Button.svelte'
    import {createEventDispatcher} from 'svelte'
    let dispatch=createEventDispatcher();
    let fields={
        question:'',
        answerA:'',
        answerB:''
    }
    let error={
        question:'',
        answerA:'',
        answerB:''
    }
    let valid=false
    const submitHandler=()=>{
        valid=true;
        if(fields.question.trim().length<5){
            error.question='Question must be at least 5 character long'
            valid=false;
        }else{
            error.question=''
        }
        if(fields.answerA.trim().length<1){
            error.answerA='Option cannot be empty'
            valid=false;
        }else{
            error.question=''
        }        
        if(fields.answerB.trim().length<1){
            error.answerB='Option cannot be empty'
            valid=false;
        }else{
            error.question=''
        }
        if(valid){
            let poll={...fields, votesA:0, votesB:0, id: Math.random()};
            dispatch('additem', poll);
        }

}
</script>

<form on:submit|preventDefault={submitHandler}>
    <h3>Question</h3>
    <input type="text" placeholder="Add question" bind:value={fields.question}>
    <div class="error">{error.question}</div>
    <h3>Option A:</h3>
    <input type="text" placeholder="Option A" bind:value={fields.answerA}>
    <div class="error">{error.answerA}</div>
    <h3>Option B:</h3>
    <input type="text" placeholder="Option B" bind:value={fields.answerB}>
    <div class="error">{error.answerB}</div>
    <div class="button_container"><Button type='secondary'>Add Poll</Button></div>
</form>

<style>
    .error{
        color: red;
        margin: 5px;
        font-weight: bold;
        font-size: 12px;
    }
    h3{
        font-size: 16px;
    }
    input{
        width: 100%;
        margin: 10px 0px;
    }
    form{
        width: 300px;
        margin: 0px auto;
    }

</style>