// components/cart/index.js
Component({
	options: {
	 virtualHost: true, // 组件虚拟化
	},
	/**
	 * 组件的属性列表
	 */
	properties: {
		shopping_cart :{
			type: Array,
			value: [],
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		change(e) {
			this.triggerEvent('change', e.currentTarget.dataset)
		},
		cleanCart(e) {
			this.triggerEvent('cleanCart')
		}
	}
})