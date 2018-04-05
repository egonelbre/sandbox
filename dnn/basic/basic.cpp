#include <math.h>
#include <stdint.h>
#include <stdio.h>
#include <array>

using namespace std;

static float frand()
{
	return rand() / static_cast<float>(RAND_MAX);
}

template <size_t InputCount, size_t OutputCount>
struct Layer
{
	using InputData = array<float, InputCount>;
	using OutputData = array<float, OutputCount>;

	array<float, OutputCount> Bias;
	array<array<float, InputCount>, OutputCount> Weight;

	constexpr float Error(const float a, const float b) {
		return 0.5f * powf(a - b, 2.0f);
	}

	constexpr float ErrorPD(const float a, const float b) {
		return a - b;
	}

	constexpr float Activate(const float a)
	{
		return 1.0f / (1.0f + expf(-a));
	}
	
	constexpr float ActivatePD(const float a)
	{
		return a * (1.0f - a);
	}
	
	constexpr void Forward(const InputData *__restrict input, OutputData *__restrict output)
	{
		for (size_t i = 0; i < OutputCount; i++)
		{
			float sum = Bias[i];
			auto weights = &Weight[i];
			for (size_t k = 0; k < InputCount; k++)
			{
				sum += (*input)[k] * (*weights)[k];
			}
			(*output)[i] = Activate(sum);
		}
	}
/*
	void Backward(InputData *__restrict input, OutputData *__restrict expected)
	{
		OutputData current;
		Forward(input, &current);

		float sum = 0.0f;
		for (size_t i = 0; i < OutputCount; i++)
		{
			float error = ErrorPD(output[i], target[i]);
			float activation = ActivatePD(output[i]);

			float sum = Bias[i];
			auto weights = &Weight[i];
			for (size_t k = 0; k < InputCount; k++)
			{
				sum += (*input)[k] * (*weights)[k];
			}
            (*output)[i] = Activate(sum);
        }
	}
*/
};

template <size_t InputCount, size_t OutputCount>
void RandomizeLayer(Layer<InputCount, OutputCount> *layer) {
	for (size_t i = 0; i < OutputCount; i++)
	{
		layer->Bias[i] = frand();
	}

	for (size_t i = 0; i < OutputCount; i++)
		for (size_t k = 0; k < InputCount; k++)
		{
			layer->Weight[i][k] = frand();
		}
}

template <size_t InputSize, size_t OutputSize>
constexpr void FeedForward(array<float, InputSize> * __restrict input, array<float, OutputSize> * __restrict output, Layer<InputSize, OutputSize> * __restrict layer)
{
	layer->Forward(input, output);
}

template <size_t InputSize, size_t HiddenSize, size_t OutputSize, typename... Layers>
constexpr void FeedForward(array<float, InputSize> * __restrict input,
	array<float, OutputSize> * __restrict output,
	Layer<InputSize, HiddenSize> * __restrict layer,
	Layers... layers)
{
	array<float, HiddenSize> hidden;
	layer->Forward(input, &hidden);
	FeedForward(&hidden, output, layers...);
}

int main()
{
	Layer<16, 16> first;
	Layer<16, 8> second;
	Layer<8, 4> third;

	RandomizeLayer(&first);
	RandomizeLayer(&second);
	RandomizeLayer(&third);

	array<float, 16> input_data;
	array<float, 16> first_data;

	array<float, 8> second_data;
	array<float, 4> output_data;

	for (size_t i = 0; i < input_data.size(); i++)
	{
		input_data[i] = frand();
	}

	printf("IN: ");
	for (size_t i = 0; i < input_data.size(); i++)
	{
		printf("%.2f, ", input_data[i]);
	}
	printf("\n");

	first.Forward(&input_data, &first_data);
	second.Forward(&first_data, &second_data);
	third.Forward(&second_data, &output_data);

	printf("OUT: ");
	for (size_t i = 0; i < output_data.size(); i++)
	{
		printf("%.2f, ", output_data[i]);
	}
	printf("\n");

	FeedForward(&input_data, &output_data, &first, &second, &third);

	printf("OUT: ");
	for (size_t i = 0; i < output_data.size(); i++)
	{
		printf("%.2f, ", output_data[i]);
	}
	printf("\n");

	return 0;
}