<script>
    import { each } from "svelte/internal";
	import Modal from "./Modal.svelte"
	let showModal=false
	let name='Om';
	let beltColour='black';
	let boxColour='orange';
const handleColour=()=>{
	if (beltColour!='#ff3e00') {
		beltColour='#ff3e00';
	}
	else beltColour='black';
};
const changeBoxColour=(e)=>{
	boxColour=e.target.value;
};
const handleClick=(id)=>{
	cart=cart.filter((cart)=>cart.item_id!=id);
	showModal=!showModal;
	console.log(showModal);
	if(showModal===false){
		showModal=true;
	}
};
	let cart=[
		{
			item_id : 1,
			item_name : 'Earphones',
			item_cost: 3000
		},
		{
			item_id : 2,
			item_name : 'Power bank',
			item_cost: 5000
		},
		{
			item_id : 3,
			item_name : 'Iphone',
			item_cost: 80000
		},
		{
			item_id : 4,
			item_name : 'Power bank',
			item_cost: 5000
		}
	]
	let numb;
	const handleText=(e)=>{
		numb=e.target.value;
		console.log(parseInt(numb));
	}
	let ress="Input the number";
	const searchNumb=()=>{
		if(numb>5000){
			ress="greater than 5000";
		}
		else{
			ress="less than 5000";
		}
	}
</script>
<Modal message="Item deleted" showModal={showModal}/>
<main>
	<h1>Hello {name}!</h1>
	<p>Hello Om.</p>
	<div style="background-color: {beltColour};">{beltColour}</div>
	<div style="background-color: {boxColour};">The colour will change here</div>
	<button on:click={handleColour}>Change colour</button>
	<input type="text" on:input={changeBoxColour} placeholder="input colour">
	<hr>
	<div class="cart_box">

		{#each cart as item (item.item_id)}
			<div class="cart_item">
				<div>
					<h3>product: {item.item_name}</h3>
					price: {item.item_cost}
				</div>
				<button on:click={()=>{handleClick(item.item_id)}}>delete item</button>
			</div>
		{:else}
		<div>No item in cart</div>
			
		{/each}

	</div>
	<hr>
	<div class="condition_box">
		<input type="text" placeholder="Type the number" on:input={handleText}>
		<button on:click={searchNumb}>Search</button>
		<div class="res">{ress}</div>
	</div>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}
	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
	.cart_item{
		background-color: coral;
		border: 2px solid black;
		border-radius: 30px;
		padding: 10px;
		margin: 3px;
		/* display: inline-block; */
		margin: auto 40%;

	}
	.cart_item button{
		margin: 10px;
		background-color: antiquewhite;
		border-radius: 10px;
		cursor: pointer;
	}
	.cart_item div{
		display: block;
	}
</style>