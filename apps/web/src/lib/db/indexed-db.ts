import type { GameSession, ScoreSnapshot } from '_/lib/flags/game'
import Dexie, { type DexieOptions, type Table } from 'dexie'

const DB_NAME = 'flags'
const SCORE_STORE = 'score-v1'
const DB_VERSION = 1
const SCORE_KEY = 'score'
const SESSION_KEY = 'session'

type StoreKey = typeof SCORE_KEY | typeof SESSION_KEY
type StoreValue = ScoreSnapshot | GameSession
type FlagsDatabase = Dexie & { store: Table<StoreValue, StoreKey> }

type DatabaseHandle =
	| {
			type: 'dexie'
			db: FlagsDatabase
	  }
	| {
			type: 'memory'
	  }

type IndexedDbFactoryProvider = () => IDBFactory | null

const memoryStore: Record<StoreKey, StoreValue | undefined> = {
	[SCORE_KEY]: undefined,
	[SESSION_KEY]: undefined,
}

const createFlagsDatabase = (indexedDbFactory: IDBFactory): FlagsDatabase => {
	const keyRange = typeof IDBKeyRange === 'undefined' ? undefined : IDBKeyRange
	const options: DexieOptions = { indexedDB: indexedDbFactory }
	if (keyRange) {
		options.IDBKeyRange = keyRange
	}
	const db = new Dexie(DB_NAME, options) as FlagsDatabase
	db.version(DB_VERSION).stores({ [SCORE_STORE]: '' })
	db.store = db.table<StoreValue, StoreKey>(SCORE_STORE)
	return db
}

const safeClone = <T>(value: T): T => {
	if (typeof structuredClone === 'function') {
		return structuredClone(value)
	}
	return JSON.parse(JSON.stringify(value)) as T
}

let factoryProvider: IndexedDbFactoryProvider = () => {
	if (typeof indexedDB === 'undefined') {
		return null
	}
	return indexedDB
}

let openDatabasePromise: Promise<DatabaseHandle> | null = null
let dexieInstance: FlagsDatabase | null = null

const closeDexieInstance = (): void => {
	if (dexieInstance?.isOpen()) {
		dexieInstance.close()
	}
	dexieInstance = null
}

const openDatabase = async (): Promise<DatabaseHandle> => {
	if (openDatabasePromise) {
		return openDatabasePromise
	}

	openDatabasePromise = (async () => {
		try {
			const factory = factoryProvider()
			if (!factory) {
				return { type: 'memory' as const }
			}

			const db = createFlagsDatabase(factory)
			await db.open()
			dexieInstance = db
			return { type: 'dexie' as const, db }
		} catch (_error) {
			closeDexieInstance()
			return { type: 'memory' as const }
		}
	})()

	return openDatabasePromise
}

async function readFromStore(key: typeof SCORE_KEY): Promise<ScoreSnapshot | null>
async function readFromStore(key: typeof SESSION_KEY): Promise<GameSession | null>
async function readFromStore(key: StoreKey): Promise<StoreValue | null> {
	const handle = await openDatabase()

	if (handle.type === 'memory') {
		const value = key === SCORE_KEY ? memoryStore[SCORE_KEY] : memoryStore[SESSION_KEY]
		return value ? safeClone(value) : null
	}

	const result = await handle.db.store.get(key)
	return result ? safeClone(result) : null
}

async function writeToStore(key: typeof SCORE_KEY, value: ScoreSnapshot): Promise<void>
async function writeToStore(key: typeof SESSION_KEY, value: GameSession): Promise<void>
async function writeToStore(key: StoreKey, value: StoreValue): Promise<void> {
	const handle = await openDatabase()

	if (handle.type === 'memory') {
		if (key === SCORE_KEY) {
			memoryStore[SCORE_KEY] = safeClone(value as ScoreSnapshot)
		} else {
			memoryStore[SESSION_KEY] = safeClone(value as GameSession)
		}
		return
	}

	await handle.db.store.put(safeClone(value), key)
}

export const getStoredScore = async (): Promise<ScoreSnapshot | null> => {
	return await readFromStore(SCORE_KEY)
}

export const persistScore = async (score: ScoreSnapshot): Promise<void> => {
	await writeToStore(SCORE_KEY, score)
}

export const getStoredSession = async (): Promise<GameSession | null> => {
	return await readFromStore(SESSION_KEY)
}

export const persistSession = async (session: GameSession): Promise<void> => {
	await writeToStore(SESSION_KEY, session)
}

export const getDatabaseVersion = async (): Promise<number> => {
	const handle = await openDatabase()
	if (handle.type === 'memory') {
		return DB_VERSION
	}
	return handle.db.verno
}

export const resetInMemoryStore = (): void => {
	delete memoryStore[SCORE_KEY]
	delete memoryStore[SESSION_KEY]
	closeDexieInstance()
	openDatabasePromise = null
}

export const setIndexedDbFactoryProvider = (provider: IndexedDbFactoryProvider): void => {
	factoryProvider = provider
	closeDexieInstance()
	openDatabasePromise = null
}

export { DB_NAME, DB_VERSION, SCORE_KEY, SCORE_STORE, SESSION_KEY }
