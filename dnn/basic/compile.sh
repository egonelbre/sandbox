#!/bin/bash

watchrun -care "*.c;*.cpp;*.h;*.hpp" \
	clang -std=c++14 -O3 -Wextra -o$1.bin $1 == \
	./$1.bin