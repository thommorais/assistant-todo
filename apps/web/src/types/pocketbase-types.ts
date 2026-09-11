/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export const Collections = {
	Authorigins: "_authOrigins",
	Externalauths: "_externalAuths",
	Mfas: "_mfas",
	Otps: "_otps",
	Superusers: "_superusers",
	ExamAnswers: "exam_answers",
	ExamAttempts: "exam_attempts",
	ExamContests: "exam_contests",
	ExamDocuments: "exam_documents",
	ExamExamQuestions: "exam_exam_questions",
	ExamQuestions: "exam_questions",
	ExamSubjects: "exam_subjects",
	Exams: "exams",
	FinanceCategories: "finance_categories",
	FinanceHouseholds: "finance_households",
	FinanceItems: "finance_items",
	FinanceLocations: "finance_locations",
	FinanceMemberships: "finance_memberships",
	FinanceRules: "finance_rules",
	FinanceTransactions: "finance_transactions",
	FinanceProducts: "finance_products",
	FinanceVendors: "finance_vendors",
	MetricsDefinitions: "metrics_definitions",
	MetricsEntries: "metrics_entries",
	Pets: "pets",
	PetsAllergies: "pets_allergies",
	PetsAnalytes: "pets_analytes",
	PetsClinics: "pets_clinics",
	PetsConditions: "pets_conditions",
	PetsExamMeasurements: "pets_exam_measurements",
	PetsExams: "pets_exams",
	PetsLabs: "pets_labs",
	PetsMedications: "pets_medications",
	PetsPhotos: "pets_photos",
	PetsProcedures: "pets_procedures",
	PetsShares: "pets_shares",
	PetsTutors: "pets_tutors",
	PetsVaccines: "pets_vaccines",
	PetsVets: "pets_vets",
	PetsVitals: "pets_vitals",
	PomodoroMoodCategories: "pomodoro_mood_categories",
	PomodoroMoodSounds: "pomodoro_mood_sounds",
	PomodoroRounds: "pomodoro_rounds",
	PomodoroSettings: "pomodoro_settings",
	PushSubscriptions: "push_subscriptions",
	ShoppingListItems: "shopping_list_items",
	ShoppingLists: "shopping_lists",
	TdahDumps: "tdah_dumps",
	TdahStatusHistory: "tdah_status_history",
	TdahTags: "tdah_tags",
	TdahTaskTags: "tdah_task_tags",
	TdahTasks: "tdah_tasks",
	TdahTimeEntries: "tdah_time_entries",
	UserNotifications: "user_notifications",
	Users: "users",
} as const
export type Collections = typeof Collections[keyof typeof Collections]

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export const ExamAnswersSelectedLetterOptions = {
	"A": "A",
	"B": "B",
	"C": "C",
	"D": "D",
	"E": "E",
} as const
export type ExamAnswersSelectedLetterOptions = typeof ExamAnswersSelectedLetterOptions[keyof typeof ExamAnswersSelectedLetterOptions]
export type ExamAnswersRecord = {
	answered_at: IsoDateString
	attempt: RecordIdString
	id: string
	is_correct?: boolean
	question: RecordIdString
	selected_letter: ExamAnswersSelectedLetterOptions
}

export const ExamAttemptsSyncStateOptions = {
	"active": "active",
	"synced": "synced",
	"void": "void",
} as const
export type ExamAttemptsSyncStateOptions = typeof ExamAttemptsSyncStateOptions[keyof typeof ExamAttemptsSyncStateOptions]
export type ExamAttemptsRecord = {
	client_attempt_id?: string
	device_id?: string
	duration_seconds?: number
	exam: RecordIdString
	id: string
	score?: number
	started_at: IsoDateString
	submitted_at?: IsoDateString
	sync_state?: ExamAttemptsSyncStateOptions
	total: number
	user: RecordIdString
}

export type ExamContestsRecord = {
	code: string
	created_at: IsoAutoDateString
	id: string
	name: string
	updated_at: IsoAutoDateString
}

export const ExamDocumentsKindOptions = {
	"exam": "exam",
	"answer_key": "answer_key",
} as const
export type ExamDocumentsKindOptions = typeof ExamDocumentsKindOptions[keyof typeof ExamDocumentsKindOptions]
export type ExamDocumentsRecord = {
	contest: RecordIdString
	created_at: IsoAutoDateString
	file: FileNameString
	id: string
	kind: ExamDocumentsKindOptions
	source_year?: number
	title: string
	updated_at: IsoAutoDateString
}

export type ExamExamQuestionsRecord = {
	exam: RecordIdString
	id: string
	order: number
	question: RecordIdString
}

export const ExamQuestionsCorrectLetterOptions = {
	"A": "A",
	"B": "B",
	"C": "C",
	"D": "D",
	"E": "E",
} as const
export type ExamQuestionsCorrectLetterOptions = typeof ExamQuestionsCorrectLetterOptions[keyof typeof ExamQuestionsCorrectLetterOptions]

export const ExamQuestionsStatusOptions = {
	"verified": "verified",
	"unverified": "unverified",
} as const
export type ExamQuestionsStatusOptions = typeof ExamQuestionsStatusOptions[keyof typeof ExamQuestionsStatusOptions]
export type ExamQuestionsRecord<Talternatives = unknown> = {
	alternatives: null | Talternatives
	contest: RecordIdString
	correct_letter: ExamQuestionsCorrectLetterOptions
	created_at: IsoAutoDateString
	disabled?: boolean
	explanation?: string
	id: string
	source_exam?: string
	source_year?: number
	statement: string
	status: ExamQuestionsStatusOptions
	subjects: RecordIdString[]
	updated_at: IsoAutoDateString
}

export type ExamSubjectsRecord = {
	code: string
	created_at: IsoAutoDateString
	id: string
	name: string
	updated_at: IsoAutoDateString
}

export const ExamsKindOptions = {
	"standard": "standard",
	"light": "light",
} as const
export type ExamsKindOptions = typeof ExamsKindOptions[keyof typeof ExamsKindOptions]
export type ExamsRecord = {
	contest: RecordIdString
	created_at: IsoAutoDateString
	created_by?: RecordIdString
	id: string
	kind: ExamsKindOptions
	question_count: number
	title: string
}

export type FinanceCategoriesRecord = {
	code: string
	color?: string
	created_at: IsoAutoDateString
	household: RecordIdString
	icon?: string
	id: string
	is_default?: boolean
	is_ignored?: boolean
	label_en: string
	label_pt: string
	parent?: RecordIdString
	position?: number
	treat_as_transfer?: boolean
	updated_at: IsoAutoDateString
}

export type FinanceHouseholdsRecord = {
	created_at: IsoAutoDateString
	id: string
	name: string
	updated_at: IsoAutoDateString
}

export type FinanceItemsRecord = {
	barcode?: string
	brand?: string
	category?: RecordIdString
	created_at: IsoAutoDateString
	id: string
	name: string
	price: number
	product?: RecordIdString
	quantity: number
	transaction: RecordIdString
	unit?: string
	updated_at: IsoAutoDateString
}

export type FinanceLocationsRecord = {
	address?: string
	city?: string
	created_at: IsoAutoDateString
	created_by: RecordIdString
	id: string
	label: string
	label_normalized: string
	updated_at: IsoAutoDateString
	vendor: RecordIdString
}

export const FinanceMembershipsRoleOptions = {
	"owner": "owner",
	"member": "member",
} as const
export type FinanceMembershipsRoleOptions = typeof FinanceMembershipsRoleOptions[keyof typeof FinanceMembershipsRoleOptions]
export type FinanceMembershipsRecord = {
	created_at: IsoAutoDateString
	household: RecordIdString
	id: string
	is_primary?: boolean
	role: FinanceMembershipsRoleOptions
	user: RecordIdString
}

export const FinanceRulesConditionsOpOptions = {
	"and": "and",
	"or": "or",
} as const
export type FinanceRulesConditionsOpOptions = typeof FinanceRulesConditionsOpOptions[keyof typeof FinanceRulesConditionsOpOptions]
export type FinanceRulesRecord<Tactions = unknown, Tconditions = unknown> = {
	actions: null | Tactions
	conditions: null | Tconditions
	conditions_op: FinanceRulesConditionsOpOptions
	created_at: IsoAutoDateString
	created_by: RecordIdString
	household: RecordIdString
	id: string
	is_active?: boolean
	name: string
	priority?: number
	updated_at: IsoAutoDateString
}

export const FinanceTransactionsCurrencyOptions = {
	"BRL": "BRL",
	"USD": "USD",
} as const
export type FinanceTransactionsCurrencyOptions = typeof FinanceTransactionsCurrencyOptions[keyof typeof FinanceTransactionsCurrencyOptions]

export const FinanceTransactionsPaymentMethodOptions = {
	"cash": "cash",
	"credit_card": "credit_card",
	"debit_card": "debit_card",
	"pix": "pix",
} as const
export type FinanceTransactionsPaymentMethodOptions = typeof FinanceTransactionsPaymentMethodOptions[keyof typeof FinanceTransactionsPaymentMethodOptions]

export const FinanceTransactionsStatusOptions = {
	"paid": "paid",
	"pending": "pending",
} as const
export type FinanceTransactionsStatusOptions = typeof FinanceTransactionsStatusOptions[keyof typeof FinanceTransactionsStatusOptions]

export const FinanceTransactionsKindOptions = {
	"expense": "expense",
	"income": "income",
} as const
export type FinanceTransactionsKindOptions = typeof FinanceTransactionsKindOptions[keyof typeof FinanceTransactionsKindOptions]

export const FinanceTransactionsSourceOptions = {
	"form": "form",
	"mcp": "mcp",
	"bank": "bank",
} as const
export type FinanceTransactionsSourceOptions = typeof FinanceTransactionsSourceOptions[keyof typeof FinanceTransactionsSourceOptions]
export type FinanceTransactionsRecord = {
	category?: RecordIdString
	created_at: IsoAutoDateString
	created_by: RecordIdString
	currency: FinanceTransactionsCurrencyOptions
	date: IsoDateString
	due_date?: IsoDateString
	household: RecordIdString
	id: string
	kind?: FinanceTransactionsKindOptions
	location?: RecordIdString
	note?: string
	payment_method: FinanceTransactionsPaymentMethodOptions
	source?: FinanceTransactionsSourceOptions
	status: FinanceTransactionsStatusOptions
	total: number
	updated_at: IsoAutoDateString
	vendor: RecordIdString
}

export type FinanceVendorsRecord = {
	created_at: IsoAutoDateString
	created_by: RecordIdString
	id: string
	name: string
	name_normalized: string
	type?: string
	updated_at: IsoAutoDateString
}

export type MetricsDefinitionsRecord = {
	created_at: IsoAutoDateString
	id: string
	name: string
	unit?: string
	updated_at: IsoAutoDateString
	user: RecordIdString
}

export type MetricsEntriesRecord = {
	created_at: IsoAutoDateString
	id: string
	metric: RecordIdString
	note?: string
	recorded_at: IsoDateString
	user: RecordIdString
	value: number
}

export const PetsSpeciesOptions = {
	"dog": "dog",
	"cat": "cat",
	"other": "other",
} as const
export type PetsSpeciesOptions = typeof PetsSpeciesOptions[keyof typeof PetsSpeciesOptions]

export const PetsSexOptions = {
	"male": "male",
	"female": "female",
	"unknown": "unknown",
} as const
export type PetsSexOptions = typeof PetsSexOptions[keyof typeof PetsSexOptions]
export type PetsRecord = {
	birth_date?: IsoDateString
	breed?: string
	chip_number?: string
	color?: string
	cover_photo?: RecordIdString
	created_at: IsoAutoDateString
	estimated_age_years?: number
	id: string
	name: string
	notes?: string
	sex: PetsSexOptions
	species: PetsSpeciesOptions
	updated_at: IsoAutoDateString
	weight_kg?: number
}

export const PetsAllergiesKindOptions = {
	"drug": "drug",
	"food": "food",
	"environmental": "environmental",
	"other": "other",
} as const
export type PetsAllergiesKindOptions = typeof PetsAllergiesKindOptions[keyof typeof PetsAllergiesKindOptions]

export const PetsAllergiesSeverityOptions = {
	"mild": "mild",
	"moderate": "moderate",
	"severe": "severe",
	"anaphylactic": "anaphylactic",
} as const
export type PetsAllergiesSeverityOptions = typeof PetsAllergiesSeverityOptions[keyof typeof PetsAllergiesSeverityOptions]
export type PetsAllergiesRecord = {
	created_at: IsoAutoDateString
	id: string
	identified_at?: IsoDateString
	kind: PetsAllergiesKindOptions
	notes?: string
	pet: RecordIdString
	reaction?: string
	severity: PetsAllergiesSeverityOptions
	substance: string
	updated_at: IsoAutoDateString
	vet?: RecordIdString
}

export const PetsAnalytesStatusOptions = {
	"verified": "verified",
	"unverified": "unverified",
} as const
export type PetsAnalytesStatusOptions = typeof PetsAnalytesStatusOptions[keyof typeof PetsAnalytesStatusOptions]

export const PetsAnalytesCategoryOptions = {
	"hematology": "hematology",
	"renal": "renal",
	"hepatic": "hepatic",
	"metabolic": "metabolic",
	"electrolytes": "electrolytes",
	"lipids": "lipids",
	"protein": "protein",
	"pancreatic": "pancreatic",
	"thyroid": "thyroid",
	"other": "other",
} as const
export type PetsAnalytesCategoryOptions = typeof PetsAnalytesCategoryOptions[keyof typeof PetsAnalytesCategoryOptions]
export type PetsAnalytesRecord<Taliases_en = unknown, Taliases_pt = unknown> = {
	aliases_en?: null | Taliases_en
	aliases_pt?: null | Taliases_pt
	canonical_code: string
	category: PetsAnalytesCategoryOptions
	created_at: IsoAutoDateString
	id: string
	loinc_code?: string
	name_en: string
	name_pt: string
	status: PetsAnalytesStatusOptions
	updated_at: IsoAutoDateString
}

export type PetsClinicsRecord = {
	address?: string
	created_at: IsoAutoDateString
	created_by: RecordIdString
	email?: string
	id: string
	name: string
	notes?: string
	phone?: string
	shared_with?: RecordIdString[]
	updated_at: IsoAutoDateString
	website?: string
}

export const PetsConditionsStatusOptions = {
	"active": "active",
	"managed": "managed",
	"resolved": "resolved",
	"suspected": "suspected",
} as const
export type PetsConditionsStatusOptions = typeof PetsConditionsStatusOptions[keyof typeof PetsConditionsStatusOptions]
export type PetsConditionsRecord = {
	created_at: IsoAutoDateString
	diagnosed_at?: IsoDateString
	id: string
	name: string
	notes?: string
	pet: RecordIdString
	resolved_at?: IsoDateString
	status: PetsConditionsStatusOptions
	updated_at: IsoAutoDateString
	vet?: RecordIdString
}

export const PetsExamMeasurementsFlagOptions = {
	"normal": "normal",
	"high": "high",
	"low": "low",
	"uncalculable": "uncalculable",
} as const
export type PetsExamMeasurementsFlagOptions = typeof PetsExamMeasurementsFlagOptions[keyof typeof PetsExamMeasurementsFlagOptions]
export type PetsExamMeasurementsRecord = {
	analyte: string
	analyte_code: string
	analyte_ref?: RecordIdString
	collected_at: IsoDateString
	created_at: IsoAutoDateString
	exam: RecordIdString
	flag: PetsExamMeasurementsFlagOptions
	id: string
	observation?: string
	panel_name?: string
	pet: RecordIdString
	raw_value: string
	ref_high?: number
	ref_low?: number
	ref_text?: string
	unit?: string
	value?: number
}

export type PetsExamsRecord = {
	clinic?: RecordIdString
	collected_at: IsoDateString
	created_at: IsoAutoDateString
	id: string
	lab?: RecordIdString
	laboratory?: string
	parsed?: boolean
	pet: RecordIdString
	protocol?: string
	requesting_vet?: RecordIdString
	source_file?: FileNameString
	summary?: string
	updated_at: IsoAutoDateString
}

export type PetsLabsRecord = {
	address?: string
	created_at: IsoAutoDateString
	created_by: RecordIdString
	email?: string
	id: string
	name: string
	notes?: string
	phone?: string
	shared_with?: RecordIdString[]
	updated_at: IsoAutoDateString
	website?: string
}

export const PetsMedicationsRouteOptions = {
	"oral": "oral",
	"topical": "topical",
	"injectable": "injectable",
	"ophthalmic": "ophthalmic",
	"otic": "otic",
	"inhaled": "inhaled",
	"other": "other",
} as const
export type PetsMedicationsRouteOptions = typeof PetsMedicationsRouteOptions[keyof typeof PetsMedicationsRouteOptions]
export type PetsMedicationsRecord = {
	active_ingredient?: string
	clinic?: RecordIdString
	condition?: RecordIdString
	created_at: IsoAutoDateString
	dose?: string
	ends_at?: IsoDateString
	frequency?: string
	id: string
	name: string
	notes?: string
	pet: RecordIdString
	procedure?: RecordIdString
	reason?: string
	route: PetsMedicationsRouteOptions
	starts_at: IsoDateString
	updated_at: IsoAutoDateString
	vet?: RecordIdString
}

export type PetsPhotosRecord = {
	caption?: string
	created_at: IsoAutoDateString
	file: FileNameString
	id: string
	pet: RecordIdString
	sort_order?: number
	taken_at?: IsoDateString
	updated_at: IsoAutoDateString
}

export const PetsProceduresKindOptions = {
	"surgery": "surgery",
	"dental": "dental",
	"imaging": "imaging",
	"minor": "minor",
	"other": "other",
} as const
export type PetsProceduresKindOptions = typeof PetsProceduresKindOptions[keyof typeof PetsProceduresKindOptions]

export const PetsProceduresAnesthesiaOutcomeOptions = {
	"uneventful": "uneventful",
	"complicated": "complicated",
} as const
export type PetsProceduresAnesthesiaOutcomeOptions = typeof PetsProceduresAnesthesiaOutcomeOptions[keyof typeof PetsProceduresAnesthesiaOutcomeOptions]
export type PetsProceduresRecord = {
	anesthesia_outcome?: PetsProceduresAnesthesiaOutcomeOptions
	anesthesia_type?: string
	clinic?: RecordIdString
	complications?: string
	created_at: IsoAutoDateString
	discharge_instructions?: string
	findings?: string
	id: string
	implants?: string
	kind: PetsProceduresKindOptions
	name: string
	notes?: string
	performed_at: IsoDateString
	pet: RecordIdString
	suture_removal_at?: IsoDateString
	updated_at: IsoAutoDateString
	vet?: RecordIdString
}

export type PetsSharesRecord = {
	created_at: IsoAutoDateString
	created_by: RecordIdString
	id: string
	label: string
	last_accessed_at?: IsoDateString
	pet: RecordIdString
	token: string
	updated_at: IsoAutoDateString
}

export const PetsTutorsRoleOptions = {
	"primary": "primary",
	"tutor": "tutor",
} as const
export type PetsTutorsRoleOptions = typeof PetsTutorsRoleOptions[keyof typeof PetsTutorsRoleOptions]
export type PetsTutorsRecord = {
	created_at: IsoAutoDateString
	display_name?: string
	id: string
	pet: RecordIdString
	role: PetsTutorsRoleOptions
	user: RecordIdString
}

export type PetsVaccinesRecord = {
	applied_at: IsoDateString
	batch?: string
	clinic?: RecordIdString
	created_at: IsoAutoDateString
	id: string
	manufacturer?: string
	name: string
	next_due_at?: IsoDateString
	notes?: string
	pet: RecordIdString
	updated_at: IsoAutoDateString
	vet?: RecordIdString
}

export type PetsVetsRecord = {
	clinic?: RecordIdString
	created_at: IsoAutoDateString
	created_by: RecordIdString
	crmv?: string
	email?: string
	id: string
	name: string
	notes?: string
	phone?: string
	shared_with?: RecordIdString[]
	updated_at: IsoAutoDateString
}

export const PetsVitalsMetricOptions = {
	"weight": "weight",
	"temperature": "temperature",
	"bcs": "bcs",
	"heart_rate": "heart_rate",
	"respiratory_rate": "respiratory_rate",
} as const
export type PetsVitalsMetricOptions = typeof PetsVitalsMetricOptions[keyof typeof PetsVitalsMetricOptions]
export type PetsVitalsRecord = {
	created_at: IsoAutoDateString
	id: string
	metric: PetsVitalsMetricOptions
	note?: string
	pet: RecordIdString
	recorded_at: IsoDateString
	unit?: string
	updated_at: IsoAutoDateString
	value: number
	vet?: RecordIdString
}

export type PomodoroMoodCategoriesRecord = {
	category_id: string
	id: string
	label: string
	sort_order: number
}

export type PomodoroMoodSoundsRecord = {
	category: RecordIdString
	enabled?: boolean
	file: FileNameString
	id: string
	label: string
	sound_id: string
}

export type PomodoroRoundsRecord = {
	completed_at: IsoDateString
	id: string
	name: string
	pause_count?: number
	paused_duration?: number
	phase: string
	planned_duration: number
	session_id?: string
	started_at: IsoDateString
	user_id: RecordIdString
	worked_duration: number
}

export type PomodoroSettingsRecord = {
	break_duration: number
	created_at: IsoAutoDateString
	focus_duration: number
	id: string
	long_break_duration: number
	rounds_before_break: number
	rounds_before_long_break: number
	session_name: string
	sound_enabled?: boolean
	total_rounds?: number
	updated_at: IsoAutoDateString
	user_id: RecordIdString
}

export type PushSubscriptionsRecord = {
	auth_key: string
	created: IsoAutoDateString
	endpoint: string
	id: string
	p256dh: string
	updated: IsoAutoDateString
	user: RecordIdString
	user_agent?: string
}

export const ShoppingListItemsSourceOptions = {
	"suggested": "suggested",
	"manual": "manual",
	"scanned": "scanned",
} as const
export type ShoppingListItemsSourceOptions = typeof ShoppingListItemsSourceOptions[keyof typeof ShoppingListItemsSourceOptions]
export type ShoppingListItemsRecord = {
	actual_price?: number
	category?: RecordIdString
	checked?: boolean
	created_at: IsoAutoDateString
	est_price?: number
	id: string
	list: RecordIdString
	name: string
	position?: number
	price_confirmed?: boolean
	quantity: number
	source: ShoppingListItemsSourceOptions
	unit?: string
	updated_at: IsoAutoDateString
}

export const ShoppingListsStatusOptions = {
	"draft": "draft",
	"shopping": "shopping",
	"closed": "closed",
} as const
export type ShoppingListsStatusOptions = typeof ShoppingListsStatusOptions[keyof typeof ShoppingListsStatusOptions]
export type ShoppingListsRecord = {
	closed_at?: IsoDateString
	created_at: IsoAutoDateString
	created_by: RecordIdString
	household: RecordIdString
	id: string
	location?: RecordIdString
	status: ShoppingListsStatusOptions
	title: string
	transaction?: RecordIdString
	updated_at: IsoAutoDateString
	vendor?: RecordIdString
}

export type TdahDumpsRecord = {
	created: IsoAutoDateString
	description?: string
	id: string
	title: string
	updated: IsoAutoDateString
	user_id: RecordIdString
}

export const TdahStatusHistoryFromStatusOptions = {
	"today": "today",
	"week": "week",
	"backlog": "backlog",
	"done": "done",
	"archived": "archived",
} as const
export type TdahStatusHistoryFromStatusOptions = typeof TdahStatusHistoryFromStatusOptions[keyof typeof TdahStatusHistoryFromStatusOptions]

export const TdahStatusHistoryToStatusOptions = {
	"today": "today",
	"week": "week",
	"backlog": "backlog",
	"done": "done",
	"archived": "archived",
} as const
export type TdahStatusHistoryToStatusOptions = typeof TdahStatusHistoryToStatusOptions[keyof typeof TdahStatusHistoryToStatusOptions]
export type TdahStatusHistoryRecord = {
	created: IsoAutoDateString
	from_status: TdahStatusHistoryFromStatusOptions
	id: string
	task_id: RecordIdString
	to_status: TdahStatusHistoryToStatusOptions
	transitioned_at: IsoDateString
	updated: IsoAutoDateString
}

export type TdahTagsRecord = {
	color?: string
	created: IsoAutoDateString
	id: string
	name: string
	updated: IsoAutoDateString
	user_id: RecordIdString
}

export type TdahTaskTagsRecord = {
	created: IsoAutoDateString
	id: string
	tag_id: RecordIdString
	task_id: RecordIdString
	updated: IsoAutoDateString
}

export const TdahTasksPriorityOptions = {
	"low": "low",
	"medium": "medium",
	"high": "high",
} as const
export type TdahTasksPriorityOptions = typeof TdahTasksPriorityOptions[keyof typeof TdahTasksPriorityOptions]

export const TdahTasksStatusOptions = {
	"today": "today",
	"week": "week",
	"backlog": "backlog",
	"done": "done",
	"archived": "archived",
} as const
export type TdahTasksStatusOptions = typeof TdahTasksStatusOptions[keyof typeof TdahTasksStatusOptions]

export const TdahTasksFreshnessOptions = {
	"fresh": "fresh",
	"aging": "aging",
	"stale": "stale",
} as const
export type TdahTasksFreshnessOptions = typeof TdahTasksFreshnessOptions[keyof typeof TdahTasksFreshnessOptions]

export const TdahTasksSizeOptions = {
	"small": "small",
	"medium": "medium",
	"large": "large",
} as const
export type TdahTasksSizeOptions = typeof TdahTasksSizeOptions[keyof typeof TdahTasksSizeOptions]
export type TdahTasksRecord<Tlinks = unknown> = {
	color?: string
	created: IsoAutoDateString
	depends_on?: RecordIdString
	description?: string
	due_date?: IsoDateString
	freshness: TdahTasksFreshnessOptions
	id: string
	is_resurfaced?: boolean
	links?: null | Tlinks
	priority: TdahTasksPriorityOptions
	size?: TdahTasksSizeOptions
	snooze_threshold?: number
	snoozed_until?: IsoDateString
	status: TdahTasksStatusOptions
	title: string
	updated: IsoAutoDateString
	user_id: RecordIdString
}

export type TdahTimeEntriesRecord = {
	created: IsoAutoDateString
	id: string
	started_at: IsoDateString
	stopped_at?: IsoDateString
	task_id: RecordIdString
	updated: IsoAutoDateString
}

export const UserNotificationsSeverityOptions = {
	"info": "info",
	"warning": "warning",
	"error": "error",
	"success": "success",
} as const
export type UserNotificationsSeverityOptions = typeof UserNotificationsSeverityOptions[keyof typeof UserNotificationsSeverityOptions]

export const UserNotificationsAppOptions = {
	"flashcards": "flashcards",
	"finance": "finance",
	"pets": "pets",
	"tdah": "tdah",
	"pomodoro": "pomodoro",
	"exams": "exams",
	"system": "system",
} as const
export type UserNotificationsAppOptions = typeof UserNotificationsAppOptions[keyof typeof UserNotificationsAppOptions]
export type UserNotificationsRecord<Tmetadata = unknown> = {
	action_url?: string
	app: UserNotificationsAppOptions
	created: IsoAutoDateString
	entity_id?: string
	entity_type?: string
	expires_at?: IsoDateString
	id: string
	is_read?: boolean
	message: string
	metadata?: null | Tmetadata
	read_at?: IsoDateString
	severity: UserNotificationsSeverityOptions
	title: string
	type: string
	updated: IsoAutoDateString
	user_id: RecordIdString
}

export type UsersRecord = {
	avatar?: FileNameString
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	is_curator?: boolean
	name?: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type ExamAnswersResponse<Texpand = unknown> = Required<ExamAnswersRecord> & BaseSystemFields<Texpand>
export type ExamAttemptsResponse<Texpand = unknown> = Required<ExamAttemptsRecord> & BaseSystemFields<Texpand>
export type ExamContestsResponse<Texpand = unknown> = Required<ExamContestsRecord> & BaseSystemFields<Texpand>
export type ExamDocumentsResponse<Texpand = unknown> = Required<ExamDocumentsRecord> & BaseSystemFields<Texpand>
export type ExamExamQuestionsResponse<Texpand = unknown> = Required<ExamExamQuestionsRecord> & BaseSystemFields<Texpand>
export type ExamQuestionsResponse<Talternatives = unknown, Texpand = unknown> = Required<ExamQuestionsRecord<Talternatives>> & BaseSystemFields<Texpand>
export type ExamSubjectsResponse<Texpand = unknown> = Required<ExamSubjectsRecord> & BaseSystemFields<Texpand>
export type ExamsResponse<Texpand = unknown> = Required<ExamsRecord> & BaseSystemFields<Texpand>
export type FinanceCategoriesResponse<Texpand = unknown> = Required<FinanceCategoriesRecord> & BaseSystemFields<Texpand>
export type FinanceHouseholdsResponse<Texpand = unknown> = Required<FinanceHouseholdsRecord> & BaseSystemFields<Texpand>
export type FinanceItemsResponse<Texpand = unknown> = Required<FinanceItemsRecord> & BaseSystemFields<Texpand>
export type FinanceLocationsResponse<Texpand = unknown> = Required<FinanceLocationsRecord> & BaseSystemFields<Texpand>
export type FinanceMembershipsResponse<Texpand = unknown> = Required<FinanceMembershipsRecord> & BaseSystemFields<Texpand>
export type FinanceRulesResponse<Tactions = unknown, Tconditions = unknown, Texpand = unknown> = Required<FinanceRulesRecord<Tactions, Tconditions>> & BaseSystemFields<Texpand>
export type FinanceTransactionsResponse<Texpand = unknown> = Required<FinanceTransactionsRecord> & BaseSystemFields<Texpand>
export type FinanceProductsRecord = {
	barcode?: string
	brand?: string
	created_at: IsoAutoDateString
	created_by: RecordIdString
	id: string
	name: string
	name_normalized: string
	updated_at: IsoAutoDateString
}

export type FinanceProductsResponse<Texpand = unknown> = Required<FinanceProductsRecord> & BaseSystemFields<Texpand>

export type FinanceVendorsResponse<Texpand = unknown> = Required<FinanceVendorsRecord> & BaseSystemFields<Texpand>
export type MetricsDefinitionsResponse<Texpand = unknown> = Required<MetricsDefinitionsRecord> & BaseSystemFields<Texpand>
export type MetricsEntriesResponse<Texpand = unknown> = Required<MetricsEntriesRecord> & BaseSystemFields<Texpand>
export type PetsResponse<Texpand = unknown> = Required<PetsRecord> & BaseSystemFields<Texpand>
export type PetsAllergiesResponse<Texpand = unknown> = Required<PetsAllergiesRecord> & BaseSystemFields<Texpand>
export type PetsAnalytesResponse<Taliases_en = unknown, Taliases_pt = unknown, Texpand = unknown> = Required<PetsAnalytesRecord<Taliases_en, Taliases_pt>> & BaseSystemFields<Texpand>
export type PetsClinicsResponse<Texpand = unknown> = Required<PetsClinicsRecord> & BaseSystemFields<Texpand>
export type PetsConditionsResponse<Texpand = unknown> = Required<PetsConditionsRecord> & BaseSystemFields<Texpand>
export type PetsExamMeasurementsResponse<Texpand = unknown> = Required<PetsExamMeasurementsRecord> & BaseSystemFields<Texpand>
export type PetsExamsResponse<Texpand = unknown> = Required<PetsExamsRecord> & BaseSystemFields<Texpand>
export type PetsLabsResponse<Texpand = unknown> = Required<PetsLabsRecord> & BaseSystemFields<Texpand>
export type PetsMedicationsResponse<Texpand = unknown> = Required<PetsMedicationsRecord> & BaseSystemFields<Texpand>
export type PetsPhotosResponse<Texpand = unknown> = Required<PetsPhotosRecord> & BaseSystemFields<Texpand>
export type PetsProceduresResponse<Texpand = unknown> = Required<PetsProceduresRecord> & BaseSystemFields<Texpand>
export type PetsSharesResponse<Texpand = unknown> = Required<PetsSharesRecord> & BaseSystemFields<Texpand>
export type PetsTutorsResponse<Texpand = unknown> = Required<PetsTutorsRecord> & BaseSystemFields<Texpand>
export type PetsVaccinesResponse<Texpand = unknown> = Required<PetsVaccinesRecord> & BaseSystemFields<Texpand>
export type PetsVetsResponse<Texpand = unknown> = Required<PetsVetsRecord> & BaseSystemFields<Texpand>
export type PetsVitalsResponse<Texpand = unknown> = Required<PetsVitalsRecord> & BaseSystemFields<Texpand>
export type PomodoroMoodCategoriesResponse<Texpand = unknown> = Required<PomodoroMoodCategoriesRecord> & BaseSystemFields<Texpand>
export type PomodoroMoodSoundsResponse<Texpand = unknown> = Required<PomodoroMoodSoundsRecord> & BaseSystemFields<Texpand>
export type PomodoroRoundsResponse<Texpand = unknown> = Required<PomodoroRoundsRecord> & BaseSystemFields<Texpand>
export type PomodoroSettingsResponse<Texpand = unknown> = Required<PomodoroSettingsRecord> & BaseSystemFields<Texpand>
export type PushSubscriptionsResponse<Texpand = unknown> = Required<PushSubscriptionsRecord> & BaseSystemFields<Texpand>
export type ShoppingListItemsResponse<Texpand = unknown> = Required<ShoppingListItemsRecord> & BaseSystemFields<Texpand>
export type ShoppingListsResponse<Texpand = unknown> = Required<ShoppingListsRecord> & BaseSystemFields<Texpand>
export type TdahDumpsResponse<Texpand = unknown> = Required<TdahDumpsRecord> & BaseSystemFields<Texpand>
export type TdahStatusHistoryResponse<Texpand = unknown> = Required<TdahStatusHistoryRecord> & BaseSystemFields<Texpand>
export type TdahTagsResponse<Texpand = unknown> = Required<TdahTagsRecord> & BaseSystemFields<Texpand>
export type TdahTaskTagsResponse<Texpand = unknown> = Required<TdahTaskTagsRecord> & BaseSystemFields<Texpand>
export type TdahTasksResponse<Tlinks = unknown, Texpand = unknown> = Required<TdahTasksRecord<Tlinks>> & BaseSystemFields<Texpand>
export type TdahTimeEntriesResponse<Texpand = unknown> = Required<TdahTimeEntriesRecord> & BaseSystemFields<Texpand>
export type UserNotificationsResponse<Tmetadata = unknown, Texpand = unknown> = Required<UserNotificationsRecord<Tmetadata>> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	exam_answers: ExamAnswersRecord
	exam_attempts: ExamAttemptsRecord
	exam_contests: ExamContestsRecord
	exam_documents: ExamDocumentsRecord
	exam_exam_questions: ExamExamQuestionsRecord
	exam_questions: ExamQuestionsRecord
	exam_subjects: ExamSubjectsRecord
	exams: ExamsRecord
	finance_categories: FinanceCategoriesRecord
	finance_households: FinanceHouseholdsRecord
	finance_items: FinanceItemsRecord
	finance_locations: FinanceLocationsRecord
	finance_memberships: FinanceMembershipsRecord
	finance_products: FinanceProductsRecord
	finance_rules: FinanceRulesRecord
	finance_transactions: FinanceTransactionsRecord
	finance_vendors: FinanceVendorsRecord
	metrics_definitions: MetricsDefinitionsRecord
	metrics_entries: MetricsEntriesRecord
	pets: PetsRecord
	pets_allergies: PetsAllergiesRecord
	pets_analytes: PetsAnalytesRecord
	pets_clinics: PetsClinicsRecord
	pets_conditions: PetsConditionsRecord
	pets_exam_measurements: PetsExamMeasurementsRecord
	pets_exams: PetsExamsRecord
	pets_labs: PetsLabsRecord
	pets_medications: PetsMedicationsRecord
	pets_photos: PetsPhotosRecord
	pets_procedures: PetsProceduresRecord
	pets_shares: PetsSharesRecord
	pets_tutors: PetsTutorsRecord
	pets_vaccines: PetsVaccinesRecord
	pets_vets: PetsVetsRecord
	pets_vitals: PetsVitalsRecord
	pomodoro_mood_categories: PomodoroMoodCategoriesRecord
	pomodoro_mood_sounds: PomodoroMoodSoundsRecord
	pomodoro_rounds: PomodoroRoundsRecord
	pomodoro_settings: PomodoroSettingsRecord
	push_subscriptions: PushSubscriptionsRecord
	shopping_list_items: ShoppingListItemsRecord
	shopping_lists: ShoppingListsRecord
	tdah_dumps: TdahDumpsRecord
	tdah_status_history: TdahStatusHistoryRecord
	tdah_tags: TdahTagsRecord
	tdah_task_tags: TdahTaskTagsRecord
	tdah_tasks: TdahTasksRecord
	tdah_time_entries: TdahTimeEntriesRecord
	user_notifications: UserNotificationsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	exam_answers: ExamAnswersResponse
	exam_attempts: ExamAttemptsResponse
	exam_contests: ExamContestsResponse
	exam_documents: ExamDocumentsResponse
	exam_exam_questions: ExamExamQuestionsResponse
	exam_questions: ExamQuestionsResponse
	exam_subjects: ExamSubjectsResponse
	exams: ExamsResponse
	finance_categories: FinanceCategoriesResponse
	finance_households: FinanceHouseholdsResponse
	finance_items: FinanceItemsResponse
	finance_locations: FinanceLocationsResponse
	finance_memberships: FinanceMembershipsResponse
	finance_products: FinanceProductsResponse
	finance_rules: FinanceRulesResponse
	finance_transactions: FinanceTransactionsResponse
	finance_vendors: FinanceVendorsResponse
	metrics_definitions: MetricsDefinitionsResponse
	metrics_entries: MetricsEntriesResponse
	pets: PetsResponse
	pets_allergies: PetsAllergiesResponse
	pets_analytes: PetsAnalytesResponse
	pets_clinics: PetsClinicsResponse
	pets_conditions: PetsConditionsResponse
	pets_exam_measurements: PetsExamMeasurementsResponse
	pets_exams: PetsExamsResponse
	pets_labs: PetsLabsResponse
	pets_medications: PetsMedicationsResponse
	pets_photos: PetsPhotosResponse
	pets_procedures: PetsProceduresResponse
	pets_shares: PetsSharesResponse
	pets_tutors: PetsTutorsResponse
	pets_vaccines: PetsVaccinesResponse
	pets_vets: PetsVetsResponse
	pets_vitals: PetsVitalsResponse
	pomodoro_mood_categories: PomodoroMoodCategoriesResponse
	pomodoro_mood_sounds: PomodoroMoodSoundsResponse
	pomodoro_rounds: PomodoroRoundsResponse
	pomodoro_settings: PomodoroSettingsResponse
	push_subscriptions: PushSubscriptionsResponse
	shopping_list_items: ShoppingListItemsResponse
	shopping_lists: ShoppingListsResponse
	tdah_dumps: TdahDumpsResponse
	tdah_status_history: TdahStatusHistoryResponse
	tdah_tags: TdahTagsResponse
	tdah_task_tags: TdahTaskTagsResponse
	tdah_tasks: TdahTasksResponse
	tdah_time_entries: TdahTimeEntriesResponse
	user_notifications: UserNotificationsResponse
	users: UsersResponse
}

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase
