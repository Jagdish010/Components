var pay_class = {};
		pay_class['Pay'] = 'brand-primary';
		pay_class['Rate'] = "num-action";
		pay_class['Qty'] = "num-action";
		pay_class['Disc'] = "num-action";
		pay_class['Del'] = "num-action del-action";

this.numpad = new NumberPad ({
    button_array: [
        ['Qty', 'Rate', 'Disc'],
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        ['Del', 0, '.']
    ],
    add_class: pay_class,
    disable_highlight: ['Qty', 'Rate', 'Disc', 'Pay'],
    reset_btns: ['Qty', 'Rate', 'Disc', 'Pay'],
    del_btn: 'Del',
    disable_btns: [],
    wrapper: $(this.$numpad_body).find('[data-fieldname="number_pad_html"]'),
    onclick: (btn_value) => {
    }
});



class NumberPad {
	constructor({
		wrapper, onclick, button_array,
		add_class={}, disable_highlight=[],
		reset_btns=[], del_btn='', disable_btns
	}) {
		this.wrapper = wrapper;
		this.onclick = onclick;
		this.button_array = button_array;
		this.add_class = add_class;
		this.disable_highlight = disable_highlight;
		this.reset_btns = reset_btns;
		this.del_btn = del_btn;
		this.disable_btns = disable_btns || [];
		this.make_dom();
		this.bind_events();
		this.value = '';
	}

	make_dom() {
		if (!this.button_array) {
			this.button_array = [
				[1, 2, 3],
				[4, 5, 6],
				[7, 8, 9],
				['', 0, '']
			];
		}

		this.wrapper.html(`
			<div class="number-pad">
				${this.button_array.map(get_row).join("")}
			</div>
		`);

		function get_row(row) {
			return '<div class="num-row">' + row.map(get_col).join("") + '</div>';
		}

		function get_col(col) {
			return `<div class="num-col" data-value="${col}"><div>${col}</div></div>`;
		}

		this.set_class();

		if(this.disable_btns) {
			this.disable_btns.forEach((btn) => {
				const $btn = this.get_btn(btn);
				$btn.prop("disabled", true)
				$btn.addClass("disabled")
				$btn.hover(() => {
					$btn.css('cursor','not-allowed');
				})
			})
		}
	}

	enable_buttons(btns) {
		btns.forEach((btn) => {
			const $btn = this.get_btn(btn);
			$btn.prop("disabled", false)
			$btn.removeClass("disabled")
			$btn.hover(() => {
				$btn.css('cursor','pointer');
			})
		})
	}

	set_class() {
		for (const btn in this.add_class) {
			const class_name = this.add_class[btn];
			this.get_btn(btn).addClass(class_name);
		}
	}

	bind_events() {
		// bind click event
		const me = this;
		this.wrapper.on('click', '.num-col', function() {
			const $btn = $(this);
			const btn_value = $btn.attr('data-value');
			if (!me.disable_highlight.includes(btn_value)) {
				me.highlight_button($btn);
			}
			if (me.reset_btns.includes(btn_value)) {
				me.reset_value();
			} else {
				if (btn_value === me.del_btn) {
					me.value = me.value.substr(0, me.value.length - 1);
				} else {
					me.value += btn_value;
				}
			}
			me.onclick(btn_value);
		});
	}

	reset_value() {
		this.value = '';
	}

	get_value() {
		return flt(this.value);
	}

	get_btn(btn_value) {
		return this.wrapper.find(`.num-col[data-value="${btn_value}"]`);
	}

	highlight_button($btn) {
		$btn.addClass('highlight');
		setTimeout(() => $btn.removeClass('highlight'), 1000);
	}

	set_active(btn_value) {
		const $btn = this.get_btn(btn_value);
		this.wrapper.find('.num-col').removeClass('active');
		$btn.addClass('active');
	}

	set_inactive() {
		this.wrapper.find('.num-col').removeClass('active');
	}
}