window.storage = new Store(
	{
		loading: false
	},
	{
		'ON_LOADING': (action, state) => {
			state.loading = true;
			return { newState: state }
		},
		'OFF_LOADING': (action, state) => {
			state.loading = false
			return { newState: state }
		}
	}
);