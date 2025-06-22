#include <emscripten.h>
#include <vector>
#include <cmath>

const int width = 7680;
const int height = 4320;
const int max_iterations = 1000;
std::vector<unsigned char> buffer(width * height * 4); // RGBA

extern "C" {

EMSCRIPTEN_KEEPALIVE
unsigned char* generate_mandelbrot(double zoom, double offsetX, double offsetY) {
    double aspect = (double)height / width;
    double min_re = -2.0 / zoom + offsetX;
    double max_re = 1.0 / zoom + offsetX;
    double min_im = -1.5 / zoom * aspect + offsetY;
    double max_im = 1.5 / zoom * aspect + offsetY;
    double re_factor = (max_re - min_re) / (width - 1);
    double im_factor = (max_im - min_im) / (height - 1);

    for (int y = 0; y < height; ++y) {
        double c_im = max_im - y * im_factor;
        for (int x = 0; x < width; ++x) {
            double c_re = min_re + x * re_factor;
            double Z_re = c_re, Z_im = c_im;
            int n = 0;
            for (; n < max_iterations; ++n) {
                double Z_re2 = Z_re * Z_re;
                double Z_im2 = Z_im * Z_im;
                if (Z_re2 + Z_im2 > 4.0) break;
                double new_re = Z_re2 - Z_im2 + c_re;
                double new_im = 2.0 * Z_re * Z_im + c_im;
                Z_re = new_re;
                Z_im = new_im;
            }
            int index = (y * width + x) * 4;
            int color = (int)(255.0 * n / max_iterations);
            buffer[index + 0] = color;
            buffer[index + 1] = color;
            buffer[index + 2] = color;
            buffer[index + 3] = 255;
        }
    }
    return buffer.data();
}

EMSCRIPTEN_KEEPALIVE
int get_width() { return width; }

EMSCRIPTEN_KEEPALIVE
int get_height() { return height; }

}
