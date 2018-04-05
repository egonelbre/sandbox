#include <math.h>
#include <stdint.h>
#include <stdio.h>
#include <array>

using namespace std;

template <size_t InputCount, size_t OutputCount>
struct Layer {
  array<float, OutputCount> Bias;
  array<array<float, InputCount>, OutputCount> Weight;

  void Randomize() {
    for (size_t i = 0; i < OutputCount; i++) {
      Bias[i] = rand() / static_cast<float>(RAND_MAX);
      for (size_t k = 0; k < InputCount; k++) {
        Weight[i][k] = rand() / static_cast<float>(RAND_MAX);
      }
    }
  }

  constexpr float Activate(float sum) { return sum > 0.0f ? sum : 0.0f; }

  constexpr void Forward(array<float, InputCount> *input,
                         array<float, OutputCount> *output) {
    for (size_t i = 0; i < OutputCount; i++) {
      float sum = Bias[i];
      auto weights = &Weight[i];
      for (size_t k = 0; k < InputCount; k++) {
        sum += (*input)[k] * (*weights)[k];
      }
      (*output)[i] = Activate(sum);
    }
  }
};

template <size_t InputSize, size_t OutputSize>
constexpr void FeedForward(array<float, InputSize> *input,
                           array<float, OutputSize> *output,
                           Layer<InputSize, OutputSize> *layer) {
  layer->Forward(input, output);
}

template <size_t InputSize, size_t HiddenSize, size_t OutputSize,
          typename... Layers>
constexpr void FeedForward(array<float, InputSize> *input,
                           array<float, OutputSize> *output,
                           Layer<InputSize, HiddenSize> *layer,
                           Layers... layers) {
  array<float, HiddenSize> hidden;
  layer->Forward(input, &hidden);
  FeedForward(&hidden, output, layers...);
}

int main() {
  srand(time(0));

  Layer<10, 10> first;
  Layer<10, 5> second;
  Layer<5, 3> third;

  first.Randomize();
  second.Randomize();
  third.Randomize();

  array<float, 10> input_data;
  array<float, 10> first_data;
  array<float, 5> second_data;
  array<float, 3> output_data;

  for (size_t i = 0; i < input_data.size(); i++) {
    input_data[i] = rand() / static_cast<float>(RAND_MAX);
  }

  printf("IN: ");
  for (size_t i = 0; i < input_data.size(); i++) {
    printf("%.2f, ", input_data[i]);
  }
  printf("\n");

  first.Forward(&input_data, &first_data);
  second.Forward(&first_data, &second_data);
  third.Forward(&second_data, &output_data);

  printf("OUT: ");
  for (size_t i = 0; i < output_data.size(); i++) {
    printf("%.2f, ", output_data[i]);
  }
  printf("\n");

  FeedForward(&input_data, &output_data, &first, &second, &third);
  printf("OUT: ");
  for (size_t i = 0; i < output_data.size(); i++) {
    printf("%.2f, ", output_data[i]);
  }
  printf("\n");

  return 0;
}