
/* Type-Safety: TSX needs confirmation that a field is, in fact, a string */
type StringKeys<T> = Extract<{
	[K in keyof T]: T[K] extends string ? K : never;
}[keyof T], string>;
/* Types of inputs supported include:
    Text: general text field
    Date: Calendar-selectable date field
    Group: Sequence of text fields, mapped to separate attributes
    NOTE: remaining inputs rely on nested attributees inside a 'setting' sub-group
    Dropdown: Pull-down style selection menu, with labels for each attribute value they represent
    Select: Mutually-exclusive attribute values with their label preceeding the bubble
    Tobble: Simple On/Off toggle, with named values (no label per value) */
type AttributeSetter<T extends { settings: Record<string, any>}> = 
	| {type: "text"; 	field: StringKeys<T>; placeholder?: string}
	| {type: "date"; 	field: StringKeys<T>; placeholder?: never}
	| {type: "group"; 	field: Extract<keyof T, string>; fields: {field: string; placeholder?: string}[]; placeholder?: never}
	/* These lower three rely on the passed input record having a 'settings' subcategory */
	| {type: "dropdown"; field: Extract<keyof T["settings"], string>; options: {value: string, label: string}[]; placeholder?: never}
	| {type: "select";	field: Extract<keyof T["settings"], string>; options: {value: string, label: string}[]; placeholder?: never}
	| {type: "toggle";	field: Extract<keyof T["settings"], string>; onName: string; offName: string; placeholder?: never}
/* Definition of a single InputField:
    Label: Header-type description of the field
    Layout: 'horizontal'/'vertical'
    Fields: One or more selected AttributeSetter[s] used to prduce the input */
interface AttributeFieldProps<T extends { settings: Record<string, any>}> {
	label: string;
	layout: string;
	fields: AttributeSetter<T> [];
}

/* Template for a page's input fields
    Should define this along-side the draft/record for the page
    As these input fields also need the draft/record passed as it's generic data-type */
export type FieldsLayout<T extends { settings: Record<string, any>}> = Record<string, AttributeFieldProps<T>>;

/* Function that actually produces the Input Fields
    Based on above-defined AttributeFieldProps
    Also needs a 'state' passed in the form of {data fields, data fields setter} */
export function InputField<T extends { settings: Record<string, any>}>({fieldName, state}: {fieldName: AttributeFieldProps<T>, state: {draft: T, setDraft: React.Dispatch<React.SetStateAction<T>>}}) {
	return (
        /* Standard 'input-field' class for all inputs */
		<div className="input-field">
            {/* Flex layout determined by AttributeFieldProps.layout, rest fixed as part of input-field */}
			<label className={`flex${fieldName.layout === "vertical" ? " flex-col" : ""} items-center justify-between w-full`}>
                {/* If AttributeFieldProps.label left blank, no header line will be printed */}
				<span className="mr-3">{fieldName.label === "" ? "" : `${fieldName.label}:`}</span>
				{fieldName.fields.map((f) => {
                    /* Both 'Text' and 'Date' fields are handled effectively the same */
					if (f.type === "text" || f.type === "date") {
						return (
							<input
								key={f.field}
								type={f.type}
								value={state.draft[f.field] as string}
								onChange={(e) =>
									state.setDraft((d) => ({ ...d, [f.field]: e.target.value}))
								}
								placeholder={f.placeholder}
								className="underlined-input"
							/>
						)}
                    /* Inside mapping of assumed 'text' style fields */
					if (f.type === "group") {
						const group = state.draft[f.field] as Record<string, string>
						return f.fields.map((sub) => (
								<input
									key={sub.field}
									value={group[sub.field]}
									onChange={(e) => state.setDraft((d) => ({
										...d,
										[f.field]: {
											...(d[f.field] as Record<string, string>),
											[sub.field]: e.target.value
										}
									}))}
									placeholder={sub.placeholder}
									className="underlined-input"
								/>
							)
						)
					}
					/* WARNING: 'settings' is currently hard-coded in. Working on the generalization still */
					if (f.type === "dropdown") {
						const group = state.draft["settings"] as Record<string, string>
						return (
							<select
								key={f.field}
								value={group[f.field]}
								onChange={(e) =>
									state.setDraft((d) => ({
										...d,
										settings: {
											...d.settings,
											[f.field]: e.target.value,
										},
									}))
								}
								className="bg-transparent border-b border-text outline-none"
							>
								{f.options.map((opt) => (
									<option key={opt.value} value={opt.value}>{opt.label}</option>
								))}
							</select>
						)
					}
					/* WARNING: 'settings' is currently hard-coded in. Working on the generalization still */
					if (f.type === "select") {
						return f.options.map((opt) => (
							<button
								key={opt.value}
								type="button"
								onClick={() =>
									state.setDraft((d) => ({
										...d,
										settings: {
											...d.settings,
											[f.field]: opt.value,
										},
									}))
								}
								className="input-field"
							>
								<span>{opt.label === "" ? "" : `${opt.label}:`}</span>
								<span className="toggle-text">
									{state.draft.settings[f.field] ===
										opt.value && (
										<span className="h-3 w-3 rounded-full bg-text" />
									)}
								</span>
							</button>
						))
					}
					/* WARNING: 'settings' is currently hard-coded in. Working on the generalization still */
					if (f.type === "toggle") {
						return (
							<button
								key={f.field}
								type="button"
								onClick={() =>
									state.setDraft((d) => ({
										...d,
										settings: {
											...d.settings,
											[f.field]: (d.settings[f.field] === f.onName ? f.offName : f.onName)
										},
									}))
								}
                                /* If we start using more toggles, we can export this class and color set somewhere */
								className={`w-14 h-7 flex items-center rounded-full transition-colors duration-300 ${
									state.draft.settings[f.field] === f.onName
										? "bg-yellow-400 justify-end" // light mode (right)
										: "bg-gray-800 justify-start" // dark mode (left)
								}`}
							>
								<span className="w-5 h-5 bg-white rounded-full shadow-md mx-1" />
							</button>
						)
					}
				})}
			</label>
		</div>
	)
}