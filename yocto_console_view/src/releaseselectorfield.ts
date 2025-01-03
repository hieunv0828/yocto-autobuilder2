import {buildbotSetupPlugin} from "buildbot-plugin-support";
buildbotSetupPlugin((reg) => {
	let selectListName = null;
	let inputRefs = null;
	let selectors = null;

	const onTransitionEndEvent = (event) => {
		/*
		 * We are looking for the transition showing the "forcebuild" dialog.
		 */
		if (!event.target.classList.contains("bb-forcebuild-modal"))
			return

		/*
		 * Find modal-body div.
		 */
		const modalDialog = Array.from(event.target.children).find(e => e.classList.contains("modal-dialog"));
		const modalContent = modalDialog ? Array.from(modalDialog.children).find(e => e.classList.contains("modal-content")) : null;
		const modalBody = modalContent ? Array.from(modalContent.children).find(e => e.classList.contains("modal-body")) : null;
		if (!modalBody)
			return;

		/*
		 * Generate a map of all inputs, identifed by the field name.
		 */
		inputRefs = new Map();
		document.querySelectorAll('input').forEach(input => {
			let idparent = input;
			while (!idparent.attributes.getNamedItem('data-bb-test-id')
			       && idparent.parentElement != modalBody) {
				       idparent = idparent.parentElement;
			}

			const id = idparent.attributes.getNamedItem('data-bb-test-id')
			if (id)
				inputRefs.set(id.value, input);

			prepareInterceptor(input);
		});

		/*
		 * Only show the pretty name in the release selector field.
		 */
		const releaseSelector = inputRefs.get('force-field-branchselector');
		const releaseSelectorLabel = releaseSelector.parentNode.previousSibling;
		const sepIdx = releaseSelectorLabel.textContent.indexOf(':');
		releaseSelectorLabel.textContent = releaseSelectorLabel.textContent.substring(0, sepIdx);

		/*
		 * Get the name of the ReleaseSelector field div.
		 */
		const branchInputId = releaseSelector.attributes.getNamedItem('id').value;
		const selectName = branchInputId.substring(0, branchInputId.lastIndexOf('-'));
		selectListName = selectName + '-listbox';
	}
	window.addEventListener('transitionend', onTransitionEndEvent);

	const onClick = (event) => {
		if (selectListName) {
			const listDiv = document.getElementById(selectListName);
			if (listDiv) {
				/*
				 * The ReleaseSelector menu is shown: save
				 * associated selectors for later and clean menu items.
				 */
				selectors = new Map();
				listDiv.childNodes.forEach(div => {
					const sepIdx = div.textContent.indexOf(':');
					const propName = div.textContent.substring(0, sepIdx);
					const content = div.textContent.substring(sepIdx + 1);
					div.textContent = propName
					selectors.set(propName, JSON.parse(content));
				});
			}
		}

		if (event.target.parentElement) {
			const parentId = event.target.parentElement.attributes.getNamedItem('id');
			if (parentId && parentId.value == selectListName) {
				/*
				 * One entry was clicked in the ReleaseSelector
				 * menu: update all fields described by the
				 * selector configuration.
				 */
				const selector = selectors.get(event.target.textContent);
				if (selector) {
					new Promise((resolve, reject) => {
						return applySelector(selector, event.target).then(resolve);
					});
				}
			}
		}
	}
	window.addEventListener('click', onClick);

	/*
	 * Apply values from the selected field selector
	 */
	async function applySelector(selector, selectList) {
		for (let [field, value] of Object.entries(selector)) {
			const input = inputRefs.get('force-field-' + field);
			if (input && input.value != value) {
				/*
				 * Setting value using input.value is not enough here: field
				 * would appear modified but this value would not be used on
				 * form submission.
				 */
				await setFieldValue(input, value);
			}
		}

		const releaseSelector = inputRefs.get('force-field-branchselector');
		releaseSelector.parentNode.previousSibling.textContent = selectList.textContent;
		releaseSelector.focus();
	}

	/*
	 * All code below is highly based on work from testing-library/user-event:
	 * https://github.com/testing-library/user-event
	 * The MIT License (MIT)
	 * Copyright (c) 2020 Giorgio Polvara
	 */
	function prepareInterceptor(element) {
		const prototypeDescriptor = Object.getOwnPropertyDescriptor(element.constructor.prototype, 'value');
		const objectDescriptor = Object.getOwnPropertyDescriptor(element, 'value');
		Object.defineProperty(element, 'value', {
			objectDescriptor,
			['set']: function(v) {
				const realFunc = prototypeDescriptor['set'];
				realFunc.call(this, v);
			}
		});
	}

	const UIValue = Symbol('Displayed value in UI');
	async function setFieldValue(element, value) {
		element.focus();
		element[UIValue] = value;
		element.value = Object.assign(new String(value), {
			[UIValue]: true
		});
	}

	document.addEventListener('blur', (e)=>{
		const event = new Event('change', {bubbles: true, target: e.target, cancelable: false});
		e.target.dispatchEvent(event);
	}, {
		capture: true,
		passive: true
	});

});
