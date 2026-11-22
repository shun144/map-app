import { describeMapStateRepositoryContract } from './map-state-repository.contract'
import { createMemoryMapStateRepository } from './memory-map-state-repository'

describeMapStateRepositoryContract('メモリ', async () =>
  createMemoryMapStateRepository(),
)
