// +build ignore

package main

type VM struct {
	R0, R1 byte
	IP     int
	Memory [1 << 10]byte
}

const (
	STOP = byte(iota)
	CONST0
	CONST1
	ADD0
	PRINT0
	PRINT1

	BACKNZ0
	BACKNZ1

	DEC0
	DEC1

	LOAD0
	LOAD1

	STORE0
	STORE1
)

func (vm *VM) Run() {
	for {
		instr := vm.Memory[vm.IP]
		vm.IP++
		switch instr {
		case STOP:
			return
		case CONST0:
			val := vm.Memory[vm.IP]
			vm.IP++
			vm.R0 = val
		case CONST1:
			val := vm.Memory[vm.IP]
			vm.IP++
			vm.R1 = val
		case ADD0:
			vm.R0 += vm.R1
		case PRINT0:
			println("r0 ", vm.R0)
		case PRINT1:
			println("r1 ", vm.R1)
		case BACKNZ0:
			if vm.R0 != 0 {
				vm.IP -= int(vm.Memory[vm.IP])
			} else {
				vm.IP++
			}
		case BACKNZ1:
			if vm.R1 != 0 {
				vm.IP -= int(vm.Memory[vm.IP])
			} else {
				vm.IP++
			}
		case DEC0:
			vm.R0 -= 1
		case DEC1:
			vm.R1 -= 1
		}
	}
}

var code = []byte{
	CONST0, 0x05,
	CONST1, 0x05,
	PRINT0,
	PRINT1,
	ADD0,
	DEC1,
	BACKNZ1, 5,
	STOP,
}

func main() {
	vm := VM{}
	vm.IP = 0
	copy(vm.Memory[:], code)
	vm.Run()
}
