import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from 'reducers/root-reducer';
let middleware = [thunk];
let store;
if(process.env.ENV==='dev'){
	store = createStore(
		rootReducer,
		compose(
			applyMiddleware(...middleware),
			window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
		)
	);
} else {
	store = createStore(
		rootReducer,
		compose(
			applyMiddleware(...middleware)
		)
	);
}
export default store;
