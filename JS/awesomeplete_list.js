class make_item_control {
	constructor(wrapper, listview=0, search_list=[], awesomplete_select=() => {}, options) {
		this.wrapper = wrapper;
		this.listview = listview;
		this.search_list = search_list;
		this.awesomplete_select = awesomplete_select
		Object.assign(this, options);
		this.wrap_control();
	}

	wrap_control() {
		this.wrapper_control = frappe.ui.form.make_control({
			df: {
				"fieldtype": "Data",
				"label": __("Search Item (Ctrl + i)"),
				"fieldname": "pos_item",
				"placeholder": __("Search Item")
			},
			parent: this.wrapper,
			// only_input: true,
			render_input: true
		});

		if (this.listview) this.awesomeplete_list();
	}

	awesomeplete_list() {
		var me = this;

		this.wrapper_control.awesomeplete =
			new Awesomplete(this.wrapper_control.$input.get(0), {
				minChars: 0,
				maxItems: 99,
				autoFirst: true,
				list: [],
				filter: function (item, input) {
					if (item.value.includes('is_action')) {
						return true;
					}

					input = input.toLowerCase();
					item = this.get_item(item.value);
					var result = item ? item.searchtext.includes(input) : '';
					if(!result) {
						me.prepare_item_mapper(input);
					} else {
						return result;
					}
				},
				item: function (item, input) {
					var d = this.get_item(item.value);
					var html = "<span>" + __(d.label || d.value) + "</span>";
					if(d.item_code) {
						html += '<br><span class="text-muted ellipsis">' + __(d.item_code) + '</span>';
					}

					return $('<li></li>')
						.data('item.autocomplete', d)
						.html('<a><p>' + html + '</p></a>')
						.get(0);
				}
			});
		
		this.prepare_item_mapper();
		this.wrapper_control.awesomeplete.list = this.search_mapper;
		this.awesomeplete_listener();
	}

	awesomeplete_listener() {
		var me = this;

		this.wrapper_control.$input
			.on('input', function (e) {
				if(me.search_mapper.length <= 1) {
					me.prepare_item_mapper(e.target.value);
				}
				me.wrapper_control.awesomeplete.list = me.search_mapper;
			})
			.on('awesomplete-select', function (e) {
				var selected = me.wrapper_control.awesomeplete
					.get_item(e.originalEvent.text.value);
				if (!selected) return;

				me.awesomplete_select(selected);
			})
			.on('focus', function (e) {
				$(e.target).val('').trigger('input');
			})
			.on("awesomplete-selectcomplete", function (e) {
				var item = me.wrapper_control.awesomeplete
					.get_item(e.originalEvent.text.value);
				// clear text input if item is action
				if (item.action) {
					$(this).val("");
				}
			});
	}

	prepare_item_mapper(key) {
		var me = this;
		var search_data = [];

		if (key) {
			key = key.toLowerCase().trim();
			var re = new RegExp('%', 'g');
			var reg = new RegExp(key.replace(re, '\\w*\\s*[a-zA-Z0-9]*'));

			search_data =  $.grep(this.search_list, function(data) {
				if(reg.test(data.item_code.toLowerCase())
					|| (data.description && reg.test(data.description.toLowerCase()))
					|| reg.test(data.item_name.toLowerCase())
					|| reg.test(data.item_group.toLowerCase())) {
						return data;
				}
			})
		} else {
			search_data = this.search_list;
		}

		this.search_mapper = [];

		search_data.forEach(function (c, index) {
			if(index < 30) {
				me.search_mapper.push({
					label: c.item_code,
					value: c.item_code,
					item_name: c.item_name,
					item_group: c.item_group,
					description: c.description,
					searchtext: ['item_code', 'item_name', 'item_group', 'description']
						.map(key => c[key]).join(' ')
						.toLowerCase()
				});
			} else {
				return;
			}
		});
	}
}