import {buildbotSetupPlugin} from "buildbot-plugin-support";
buildbotSetupPlugin((reg) => {
	let selectInputName = null;
	let selectListName = null;
	let inputRefs = null;

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
		if (sepIdx >= 0) {
			releaseSelectorLabel.textContent = releaseSelectorLabel.textContent.substring(0, sepIdx);
		}

		/*
		 * Get the name of the ReleaseSelector field div.
		 */
		selectInputName = releaseSelector.attributes.getNamedItem('id').value;
		const selectName = selectInputName.substring(0, selectInputName.lastIndexOf('-'));
		selectListName = selectName + '-listbox';
	}
	window.addEventListener('transitionend', onTransitionEndEvent);

	function updateSelectors() {
		if (selectListName) {
			const listDiv = document.getElementById(selectListName);
			if (listDiv) {
				/*
				 * The ReleaseSelector menu is shown: clean menu items.
				 */

				listDiv.childNodes.forEach(div => {
					const sepIdx = div.textContent.indexOf(':');
					if (sepIdx >= 0) {
						div.textContent = div.textContent.substring(0, sepIdx);
					}
				});
			}
		}
	}

	function findApplySelector() {
		/*
		 * One entry was clicked in the ReleaseSelector
		 * menu: update all fields described by the
		 * selector configuration.
		 */
		const branchInput = document.getElementById(selectInputName);
		const inputText = branchInput.parentElement.previousElementSibling.textContent;
		const sepIdx = inputText.indexOf(':');
		const selectorName = inputText.substring(0, sepIdx);
		const selector = inputText.substring(sepIdx + 1);

		new Promise((resolve, reject) => {
			return applySelector(JSON.parse(selector), selectorName).then(resolve);
		});
	}

	const onClick = (event) => {
		updateSelectors();

		if (event.target.parentElement) {
			const parentId = event.target.parentElement.attributes.getNamedItem('id');
			if (parentId && parentId.value == selectListName) {
				findApplySelector();
			}
		}
	}
	window.addEventListener('click', onClick);

	const onKeyDown = (event) => {
		if (event.key == "Enter") {
			findApplySelector();
		} else {
			updateSelectors();
		}
	}
	window.addEventListener('keydown', onKeyDown);

	/*
	 * Apply values from the selected field selector
	 */
	async function applySelector(selector, selectorName) {
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
		releaseSelector.parentNode.previousSibling.textContent = selectorName;
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
