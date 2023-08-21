import F from './f';

/**
 *
 * @param target
 */
const buildChangedRequest = (target, pathStack, value) => {
	let temp = target;

	while (pathStack.length > 1) {
		let nextProp = pathStack.shift();
		if (temp[nextProp] == null) {
			temp[nextProp] = {};
		}
		temp = temp[nextProp];
	}

	temp[pathStack.shift()] = value;

	return target;
}

/**
 *
 * @param ctx this ref of current component
 */
const doChange = (ctx, path) => (value)=> {
	if (path == null || path.trim() === '') {
		return;
	}

	let propChain = path.split('.');
	let firstProp = propChain[0];
	if (propChain.length === 1) {
		let next = {};
		next[firstProp] = value;
		ctx.setState(next);
		return;
	}

	let next = {};
	next[firstProp] = buildChangedRequest(ctx.state[firstProp], propChain.slice(1), value);
	ctx.setState(next);
}

/**
 * Usage:
 *
 * <code>
 *      import {oneWayBind} from 'react-redux-data-binding';
 *      let $ = oneWayBind(this.props);
 *      <MyComponent $("username") />
 * </code>
 *
 *
 * @param context
 */
export const oneWayBind = (context) => (path, defaultValue) => {
	return F.of(context).at(path).value(defaultValue);
}

/**
 * Usage :
 * <code>
 *    import {twoWayBind} from 'react-redux-data-binding';
 *    let $$ = twoWayBind(this);
 *    <MyComponent ...$$("username") />
 * </code>
 *
 * @param context
 */
export const twoWayBind = (value = 'value', ...event)=> (context, onChange) => (path, defaultValue) => {
	let result = {};
	result[value] = F.of(context.state).at(path).value(defaultValue);
	event.forEach(e => result[e] = value => {
		if (onChange != null) {
			onChange({path, value});
			return;
		}
		doChange(context, path)(value)
	});
	return result;
}
