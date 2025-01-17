import { Directive, ref } from 'vue';
import { isDeviceTouch } from '@/scripts/is-device-touch';
import { popup } from '@/os';

const start = isDeviceTouch ? 'touchstart' : 'mouseover';
const end = isDeviceTouch ? 'touchend' : 'mouseleave';

export default {
	mounted(el: HTMLElement, binding, vn) {
		const self = (el as any)._tooltipDirective_ = {} as any;

		self.text = binding.value as string;
		self._close = null;
		self.showTimer = null;
		self.hideTimer = null;
		self.checkTimer = null;

		self.close = () => {
			if (self._close) {
				clearInterval(self.checkTimer);
				self._close();
				self._close = null;
			}
		};

		const show = async e => {
			if (!document.body.contains(el)) return;
			if (self._close) return;
			if (self.text == null) return;

			const showing = ref(true);
			popup(await import('@/components/ui/tooltip.vue'), {
				showing,
				text: self.text,
				source: el
			}, {}, 'closed');

			self._close = () => {
				showing.value = false;
			};
		};

		el.addEventListener('selectstart', e => {
			e.preventDefault();
		});

		el.addEventListener(start, () => {
			clearTimeout(self.showTimer);
			clearTimeout(self.hideTimer);
			self.showTimer = setTimeout(show, 300);
		}, { passive: true });

		el.addEventListener(end, () => {
			clearTimeout(self.showTimer);
			clearTimeout(self.hideTimer);
			self.hideTimer = setTimeout(self.close, 300);
		}, { passive: true });

		el.addEventListener('click', () => {
			clearTimeout(self.showTimer);
			self.close();
		});
	},

	unmounted(el, binding, vn) {
		const self = el._tooltipDirective_;
		clearInterval(self.checkTimer);
	},
} as Directive;
