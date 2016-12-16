#include <stdio.h>
#include <string.h>

#include "inttypes.h"

#define MAX_MEMORY     (1<<10)
#define MAX_COMPONENTS (1<<8)
#define MAX_WIRES      (1<<8)

typedef void (*StepFn)(void*);

StepFn StepFnTable[MAX_COMPONENTS];

typedef struct {
	size_t from, to;
	size_t size;
} Wire;

typedef struct {
	size_t  wire_head;
	Wire    wires[MAX_WIRES];

	size_t  index_head;
	size_t  index[MAX_COMPONENTS];

	size_t  arena_head;
	uint8_t arena[MAX_MEMORY];
} Sim;

typedef struct {
	uint8_t size;
	uint8_t type;
	uint8_t memory[0];
} Component;

void *Sim_NewComponent(Sim *sim, uint8_t type, size_t size) {
	size_t head = sim->arena_head;

	sim->index[sim->index_head] = head;
	sim->index_head++;

	sim->arena_head += sizeof(Component) + size;


	Component *c = (Component*)(&sim->arena[head]);
	c->size = uint8_t(size);
	c->type = type;

	return &(c->memory);
}

#define Sim_Add(sim, Decl) ((Decl*)Sim_NewComponent(sim, Decl##Type, sizeof(Decl)))

void Sim_AddWire(Sim *sim, void *from, void *to, size_t size) {
	size_t i = sim->wire_head;
	sim->wire_head++;

	sim->wires[i].from = (size_t)(from) - (size_t)(&sim->arena);
	sim->wires[i].to   = (size_t)(to)   - (size_t)(&sim->arena);
	sim->wires[i].size = size;
}

#define Sim_Connect(sim, from, to) Sim_AddWire(sim, &from, &to, sizeof from)

void Sim_Step(Sim *sim){
	// propagate values
	for(size_t i = 0; i < sim->wire_head; i++){
		Wire w = sim->wires[i];
		memcpy(&sim->arena[w.to], &sim->arena[w.from], w.size);
	}

	// update component states
	for(size_t i = 0; i < sim->index_head; i++){
		size_t index = sim->index[i];

		Component *c = (Component*)(&sim->arena[index]);
		StepFnTable[c->type](&(c->memory));
	}
}

// e.g.
#define SumType  0
typedef struct {
	int in;
	int total;
} Sum;

void Sum_Step(Sum *state) {
	state->total += state->in;
}

#define DeltaType 1
typedef struct {
	int in;
	int last;
	int out;
} Delta;

void Delta_Step(Delta *state) {
	state->out = state->last - state->in;
	state->last = state->in;
}

int main(){
	StepFnTable[SumType]   = (StepFn)Sum_Step;
	StepFnTable[DeltaType] = (StepFn)Delta_Step;

	Sim sim = {0};

	Sum *sum = Sim_Add(&sim, Sum);
	Delta *delta = Sim_Add(&sim, Delta);
	Sim_Connect(&sim, sum->total, delta->in);

	int i = 0;
	while(i < 10){
		sum->in = i++;
		Sim_Step(&sim);
		printf("# %d\nsum:(%d:%d)\ndelta:(%d:%d:%d)\n", i,
			sum->in, sum->total,
			delta->in, delta->last, delta->out);
	}
}