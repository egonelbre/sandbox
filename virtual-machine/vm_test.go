package main

import "testing"

type InstructionSet interface {
	Advance(vm *VM)
	Stop(vm *VM)
}

type VM struct {
	IP     int
	Memory [1 << 14]byte
}

type CPUDirect struct{}

func (cpu *CPUDirect) Advance(vm *VM) { vm.IP++ }
func (cpu *CPUDirect) Stop(vm *VM)    { vm.IP++ }

func BenchmarkDirect(b *testing.B) {
	vm := &VM{}
	cpu := &CPUDirect{}
	for i := 0; i < b.N; i++ {
		cpu.Advance(vm)
		cpu.Stop(vm)
		cpu.Advance(vm)
		cpu.Stop(vm)
		cpu.Advance(vm)
		cpu.Stop(vm)
		cpu.Advance(vm)
		cpu.Stop(vm)
		cpu.Advance(vm)
		cpu.Stop(vm)
	}
}

type CPUInterface struct{}

func (cpu *CPUInterface) Advance(vm *VM) { vm.IP++ }
func (cpu *CPUInterface) Stop(vm *VM)    { vm.IP++ }

func BenchmarkInterface(b *testing.B) {
	var iset InstructionSet
	vm := &VM{}
	iset = &CPUInterface{}
	for i := 0; i < b.N; i++ {
		iset.Advance(vm)
		iset.Stop(vm)
		iset.Advance(vm)
		iset.Stop(vm)
		iset.Advance(vm)
		iset.Stop(vm)
		iset.Advance(vm)
		iset.Stop(vm)
		iset.Advance(vm)
		iset.Stop(vm)
	}
}

type CPUUnknown struct{}

func (cpu *CPUUnknown) Advance(vm *VM) { vm.IP++ }
func (cpu *CPUUnknown) Stop(vm *VM)    { vm.IP++ }

func BenchmarkInterfaceUnknown(b *testing.B) {
	var iset interface{}
	vm := &VM{}
	iset = &CPUUnknown{}
	for i := 0; i < b.N; i++ {
		iset.(InstructionSet).Advance(vm)
		iset.(InstructionSet).Stop(vm)
		iset.(InstructionSet).Advance(vm)
		iset.(InstructionSet).Stop(vm)
		iset.(InstructionSet).Advance(vm)
		iset.(InstructionSet).Stop(vm)
		iset.(InstructionSet).Advance(vm)
		iset.(InstructionSet).Stop(vm)
		iset.(InstructionSet).Advance(vm)
		iset.(InstructionSet).Stop(vm)
	}
}
