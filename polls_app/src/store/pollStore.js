import {writable} from 'svelte/store'

const pollStore=writable(
    [
		{
			id:2,
			question:'Python or Java',
			answerA:'Python',
			answerB:'Java',
			votesA:12,
			votesB:10
		},
    ]
)
export default pollStore